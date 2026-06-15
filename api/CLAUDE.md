# api/ — CLAUDE.md

`@capo/api`: **NestJS 11** backend using **MikroORM** over **MariaDB**. See the root `CLAUDE.md` for the monorepo overview, environment, and comment/doc conventions.

## Commands

Run locally inside `api/` with Bun (the Docker image is production-only — `node dist/main`):

```bash
bun run start:dev        # nest watch mode (needs DB/JWT vars in api/.env.local)
bun run lint             # eslint --fix
bun run test             # jest (unit specs: *.spec.ts under src/)
bun run test cut-list    # run specs matching a path/name
bun run test:e2e         # jest with test/jest-e2e.json
bun run build            # nest build → dist/
```

Path aliases (`tsconfig.json`): `@common/*`, `@config/*`, `@modules/*`, `@shared/*`, `@database/*`.

## Architecture

Each feature under `src/modules/<name>/` follows the same four-layer shape, re-exported via a barrel `index.ts` (which is what `@modules/<name>` resolves to):

- **`*.controller.ts`** — HTTP routes. Guarded with `@UseGuards(JwtCookieAuthGuard, RolesGuard)` + `@Roles(...)`, and serialized with `@SerializeResponse(Dto, "group")`.
- **`*.service.ts`** — business logic. Emits and listens to cross-module events via `EventEmitter2` / `@OnEvent`.
- **`*.repository.ts`** — all MikroORM data access. Defines `FULL_POPULATE_FIELDS` / `MINIMAL_POPULATE_FIELDS` constants and uses `@Transactional()` for writes.
- **`*.gateway.ts`** *(stage modules only)* — socket.io `@WebSocketGateway({ namespace })` that listens for service events and broadcasts to clients.

Cross-cutting pieces:

- **Auth**: JWT carried in a cookie named `token` (`AuthService` signs it; `JwtCookieAuthGuard` + `passport-jwt` validate it). `RolesGuard` checks the `@Roles(...)` metadata against the user's roles. Inject the authenticated user with the `@User()` param decorator. Token/cookie lifetime both derive from `JWT_EXPIRATION` via `durationToMs` (`@common/utils/parse-duration`).
- **Serialization**: `SerializeInterceptor` calls MikroORM `wrap(entity).toObject()` then `class-transformer`'s `plainToInstance` with `excludeExtraneousValues` + the named group. Response shape is therefore controlled by `@Expose({ groups: [...] })` on the response DTOs in each module's `dto/`.
- **Error mapping**: `MikroOrmNotFoundInterceptor` (global) turns ORM "not found" errors into 404s, so repositories use `findOneOrFail`.
- **Shared entities** (`@database/entities`) are the cross-module domain core (`PartEntity`, `WorkStatusTypeEntity`, `IsometricEntity`, etc.); module-local entities live under `modules/<name>/entities/`. Schema is owned by `db/` — see `db/CLAUDE.md`.
- **API docs**: Swagger UI at `/api` (`SwaggerModule.setup` in `main.ts`); per-endpoint docs come from custom decorators like `@ApiLogin()` defined in each module's `*.swagger.ts`.
- **Health**: `AppController` exposes the only non-feature route, `GET /health` (liveness), consumed by the Docker healthcheck.
- **Config & shared layout**: env/ORM/Swagger config in `src/config/`; cross-module DTOs and types in `src/shared/` (e.g. `request-with-user`); reusable decorators (`@Roles`, `@User`, `@SerializeResponse`), guards, interceptors, pipes, and utils in `src/common/`.

### Work progression (HTTP entry points)

Work advances through two HTTP patterns, both of which run the service → event → gateway flow below:

- **`PATCH /<item>s/:id/step`** — advances a single item's status (`to-do → working → finished`): `pipe-lengths`, `joints`, `welds`. Optional `heatNumber` / `notes` query params capture data at the transition.
- **`PATCH /<list>s/:id/set-working`** — list-level transition for the stage lists: `cut-lists`, `assembly-lists`, `weld-lists`.

### Real-time update flow

The canonical pattern, e.g. when an operator finishes a cut:

1. Controller → `service.updateWorkStatusToWorking/Finished(...)`.
2. Service persists via repository, then `eventEmitter.emit("cut-list.updateWorkStatusTo...", populatedEntity, userId)`.
3. Other services may `@OnEvent` that to cascade status (e.g. finishing all pipe-lengths in a cut-list auto-finishes the cut-list).
4. The module's gateway `@OnEvent` handler broadcasts `server.emit("updateWorkStatus", serialized)` on its namespace.
5. The web client's `useWebSocket` hook receives it and patches local state.

### Domain model

Production hierarchy (roughly): `Project → Isometric → Sheet → Rev → Spool → Joint → Part`. A `Part` is either a `PipeLength` or a `Fitting` (`PartType` enum). The three shop stages each have a list entity (`CutListEntity`, `AssemblyListEntity`, `WeldListEntity`) and their own `*-work-status` join entity recording status transitions over time. Status is `to-do | working | finished` (`WorkStatusType`); the **last** entry in a `workStatuses` collection is the current status. Roles: `cutting-operator`, `pipe-fitter` (assembly), `welder`, `administrator`.
