# api/ — CLAUDE.md

`@capo/api`: NestJS 11 + MikroORM over MariaDB. See the root `CLAUDE.md` for the monorepo overview, domain model, and conventions.

## Commands

Local with Bun (the Docker image is production-only — `node dist/main`):

```bash
bun run start:dev   # nest watch (needs DB/JWT vars in api/.env.local)
bun run lint        # eslint --fix
bun run build       # nest build → dist/
bun run test        # unit (domain), no DB
bun run test:e2e    # boot + auth + gating, needs a MariaDB
```

Path aliases (`tsconfig.json`): `@common/*`, `@config/*`, `@modules/*`, `@shared/*`, `@database/*`.

## Testing

With **no doc-comments in code, behaviour is pinned by tests** (see the root `CLAUDE.md`). Two tiers, run in CI (`.github/workflows/ci.yml`):

- **Unit** (`*.spec.ts` next to the source, `jest.config.js`, `@swc/jest`) — pure **domain**: the state-machine verbs and claim invariants on the entities, and `ClaimControlPolicy`. No ORM/DB. The claim lock is one parametrised suite over the three list entities (identical logic). Gotchas: swc runs with `decoratorMetadata:false` (the eager `design:type` would trip the `user`↔`user-role` import cycle — only the live ORM needs it); `transformIgnorePatterns` lets the ESM-only `@mikro-orm`/`kysely` through; `test/jest-unit-setup.ts` stubs `Collection.add` (no live EM offline).
- **e2e** (`test/*.e2e-spec.ts`, `test/jest-e2e.json`, **ts-jest**) — boots the real app via `@nestjs/testing` against a throwaway MariaDB that **testcontainers** spins up (`GenericContainer` + `db/*.sql` applied on `globalSetup`, stopped on teardown); covers auth (login/me/guard) and the **cut→assembly gating**. ts-jest here (not swc) because the ORM needs `emitDecoratorMetadata`, which the tsc-style emit tolerates through the entity cycle (swc doesn't); `createMikroOrmConfig` sets `preferTs` outside production so discovery uses `entitiesTs`. No manual DB, no CI service container: `globalSetup` auto-detects the Podman socket (`DOCKER_HOST`) and the script sets `TESTCONTAINERS_RYUK_DISABLED` (the reaper is broken rootless); the dynamic port reaches the workers via `test/.testcontainer.json`.

## Architecture

CQRS + rich domain. Each feature in `src/modules/<name>/` (barrel `index.ts` = `@modules/<name>`):

- **`*.controller.ts`** — thin: `@UseGuards(JwtCookieAuthGuard, RolesGuard)` + `@Roles(...)`, dispatches on the `CommandBus`/`QueryBus`, returns the entity.
- **`entities/*.entity.ts`** — **rich domain**: state-machine verbs (`pipeLength.startCutting`, `joint.complete`, `weld.complete`) and the claim invariants (`list.claimBy`/`release`/`reassignTo`) live here; aggregates extend `AggregateRoot` and `raise()` domain events. A custom `EntityRepository` (raw-SQL gating/counts, `FULL_POPULATE` constants) is registered via `@Entity({ repository })` **only when it adds queries** beyond the base — otherwise inject the default `EntityRepository`.
- **`application/{commands,queries}.ts`** — message classes (`constructor(readonly data: {...})`).
- **`application/handlers/*.handler.ts`** — one use-case per file (`@CommandHandler`/`@QueryHandler`); the write is `@Transactional`, then the handler publishes the aggregate's domain events **post-commit** on the `EventBus`.
- **`events/*.event.ts` + `*.projection.ts`** — a domain event and the `@EventsHandler` that projects it onto the stage socket.
- **`*.gateway.ts`** *(list modules only)* — socket.io holder (`@WebSocketServer` + JWT-handshake middleware) whose `emit*` methods the projections call.
- **`*.module.ts`** — local `const imports`/`controllers`/`providers`; handlers and projections listed individually.

Shared domain in `@common/domain` (`AggregateRoot`; `ClaimControlPolicy` = the claimer-or-admin lock, provided by `DomainModule`) and `@common/utils` (`deriveListProgress`). DI: a module using `RolesGuard` imports `UserRoleModule`; one using the claim policy imports `DomainModule`; an item module `forFeature`s its list entity (for the lock).

Cross-cutting:

- **Auth:** JWT in the `token` cookie. `POST /auth/login` (`LoginCommand` verifies the password + signs the JWT; the controller sets the cookie), `POST /auth/logout` (clears the cookie), `GET /auth/me` (`GetMeQuery`). `JwtCookieAuthGuard` + passport-jwt validate; `RolesGuard` accepts **any** of the `@Roles(...)`; inject the user via `@User()`.
- **Serialization:** native MikroORM — controllers return the entity; `toJSON()`/`wrap().toObject()` honor `@Property({ hidden })` (secrets) and `@Property({ persist: false })` (derived fields). No interceptor, no class-transformer on responses (request DTOs still use class-validator).
- **Security baseline:** helmet, `@nestjs/throttler` (stricter on login), global `ValidationPipe` (whitelist/forbidNonWhitelisted/transform), CORS via `config.getOrThrow("CORS_ORIGIN")`, global `AllExceptionsFilter`, Swagger only outside production. The document handler guards path traversal (section allowlist + contained path).
- **Layout:** env/ORM (factory `createMikroOrmConfig` + `forRootAsync`)/Swagger in `src/config/`; cross-module DTOs/types in `src/shared/`; decorators/guards/filters/utils in `src/common/`; shared entities in `@database/entities`. Health: `GET /health`.

### Work progression (HTTP)

- **`POST /<item>s/:id/status-events`** advances an item (`pipe-lengths`/`joints`/`welds`), applying the stage state machine; the body carries `heatNumber` / `fillerMaterial`+`wps` / `notes` as the stage requires. `GET /<item>s/:id` and `.../status-events` (history).
- **Claim as sub-resource:** `POST` / `DELETE` / `PUT /<x>-lists/:id/claim` (claim / release / admin reassign). Lists are read-only collections (`GET /`, `GET /:id`); progress and gating are computed, not stored.

### Real-time

A handler publishes the aggregate's domain events **post-commit** → an `@EventsHandler` projection broadcasts on the stage's socket namespace. The **downstream** stage subscribes to the upstream item event (`assembly` ← `PipeLengthStatusChangedEvent`, `weld` ← `JointStatusChangedEvent`) and re-emits an invalidation signal, so a now-available order surfaces without refresh. Handshake is JWT-authenticated (`createWsAuthMiddleware`); the web client invalidates its query on any event. Single `EventBus` — no `EventEmitter2`.
