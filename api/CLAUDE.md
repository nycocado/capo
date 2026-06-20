# api/ — CLAUDE.md

`@capo/api`: NestJS 11 + MikroORM over MariaDB. See the root `CLAUDE.md` for the monorepo overview, domain model, and conventions.

## Commands

Local with Bun (the Docker image is production-only — `node dist/main`):

```bash
bun run start:dev   # nest watch (needs DB/JWT vars in api/.env.local)
bun run lint        # eslint --fix
bun run build       # nest build → dist/
```

Path aliases (`tsconfig.json`): `@common/*`, `@config/*`, `@modules/*`, `@shared/*`, `@database/*`.

## Architecture

> Changes in F8 (CQRS + rich domain: controller → use-case/handler + custom EntityRepository + EventBus). Current shape below.

Each feature in `src/modules/<name>/` is a barrel (`index.ts` = `@modules/<name>`):

- **`*.controller.ts`** — HTTP routes; `@UseGuards(JwtCookieAuthGuard, RolesGuard)` + `@Roles(...)`; returns the entity directly.
- **`*.service.ts`** — business logic: per-item state machine, claim/lock, derived progress/gating; emits `EventEmitter2` events.
- **`*.repository.ts`** — all MikroORM access; `FULL_POPULATE_FIELDS` constants, aggregate queries (gating/counts) in raw SQL, `@Transactional()` writes.
- **`*.gateway.ts`** *(list modules only)* — socket.io `@WebSocketGateway({ namespace })`; `@OnEvent` → broadcast.

Cross-cutting:

- **Auth:** JWT in the `token` cookie (`AuthService` signs; `JwtCookieAuthGuard` + passport-jwt validate). `RolesGuard` accepts **any** of the `@Roles(...)`. Inject the user via `@User()`. `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- **Serialization:** native MikroORM — controllers return the entity; `toJSON()`/`wrap().toObject()` honor `@Property({ hidden })` (secrets) and `@Property({ persist: false })` (derived fields). No interceptor, no class-transformer on responses (request DTOs still use class-validator).
- **Security baseline:** helmet, `@nestjs/throttler` (stricter on login), global `ValidationPipe` (whitelist/forbidNonWhitelisted/transform), CORS via `config.getOrThrow("CORS_ORIGIN")`, global `AllExceptionsFilter`, Swagger only outside production. `DocumentService` guards path traversal (section allowlist + contained path).
- **Layout:** env/ORM (factory `createMikroOrmConfig` + `forRootAsync`)/Swagger in `src/config/`; cross-module DTOs/types in `src/shared/`; decorators/guards/filters/utils in `src/common/`; shared entities in `@database/entities`. Health: `GET /health`.

### Work progression (HTTP)

- **`POST /<item>s/:id/status-events`** advances an item (`pipe-lengths`/`joints`/`welds`), applying the stage state machine; the body carries `heatNumber` / `fillerMaterial`+`wps` / `notes` as the stage requires. `GET /<item>s/:id` and `.../status-events` (history).
- **Claim as sub-resource:** `POST` / `DELETE` / `PUT /<x>-lists/:id/claim` (claim / release / admin reassign). Lists are read-only collections (`GET /`, `GET /:id`); progress and gating are computed, not stored.

### Real-time

Service write → `eventEmitter.emit("<item>.statusChanged" | "<list>.claimChanged", …)` → the stage gateway's `@OnEvent` re-broadcasts on its namespace. The **downstream** gateway also re-emits a signal on upstream changes (cross-stage gating: finishing cut surfaces the now-available assembly order without refresh). Handshake is JWT-authenticated (`createWsAuthMiddleware`). The web client invalidates its query on any event.
