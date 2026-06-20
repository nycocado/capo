# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Per-area detail lives in nested `CLAUDE.md` files, loaded automatically when working in that directory:
- `api/CLAUDE.md` — NestJS backend (module pattern, auth, real-time, domain model)
- `web/CLAUDE.md` — Next.js frontend (App Router, hook composition, routing)
- `db/CLAUDE.md` — database schema & seed
- `nginx/CLAUDE.md` — reverse proxy

## What this is

CAPO (Computer Aided Process Overview) is a metallurgical pipeline-production management system. It tracks pipeline parts through three shop-floor stages — **cut**, **assembly**, **weld** — with role-specific operator interfaces and real-time updates.

This is an **npm-workspaces monorepo** with two deployable apps plus a database, wired together by Docker Compose behind an nginx reverse proxy:

- `api/` — `@capo/api`, a **NestJS 11** backend using **MikroORM** over **MariaDB**.
- `web/` — `@capo/web`, a **Next.js 16** (App Router, React 19) frontend.
- `db/` — raw SQL schema + seed data (the database is **not** managed by ORM migrations).
- `nginx/` — reverse proxy: `/api/` → api, `/socket.io/` → api WebSockets, everything else → web.

## Filter in the query, not in JS (IMPORTANT)

**Always filter and aggregate in the database query — never by loading rows and discarding them in JavaScript.** Use the repository query (`WHERE` / QueryBuilder, `count`/`getCount`), not `.filter()`/`.length` over a full result set. This is a hard preference for performance: the DB does the work and only the needed rows cross the wire. The frontend then just renders what the API returns — if a row shouldn't appear, the query shouldn't return it.

## Commands

Orchestration runs from the repo root. The package manager and script runner is **Bun** (`bun.lock` is the monorepo lockfile); Node runs the apps. **Docker/Compose builds production images** — multi-stage `builder`/`runner` Dockerfiles: web as a Next.js **standalone** server (`node server.js`), API as `node dist/main`, both non-root. **Day-to-day development runs locally with Bun** against the Dockerized DB; there is no hot-reload-in-container workflow (and no `.dev` Dockerfiles). App-specific commands (test, lint, build) live in `api/CLAUDE.md` and `web/CLAUDE.md`.

```bash
bun install              # install all workspaces (writes bun.lock)
bun run docker:up        # build + start the production stack (nginx, db, api, web)
bun run docker:up:bg     # same, detached
bun run docker:down      # stop and remove volumes (drops the DB)
bun run docker:rebuild   # down -v then up --build (full reset, re-seeds DB)
bun run logs:api         # tail a single service (also logs:web, logs:db)
bun run exec:db          # mysql shell into the db container
bun run format           # prettier --write across the whole repo

# local development (against the Dockerized DB):
cd web && bun run dev        # NextJS dev server (hot reload)
cd api && bun run start:dev   # NestJS watch mode (needs DB vars in api/.env.local)
```

## Environment / config

No `.env` files are committed (all gitignored). Three are required (templates: `.env.example` in each location):

- Root `.env` — consumed by `docker-compose.yml`: `NGINX_PORT`, `MARIADB_*` (`HOST`, `PORT`, `USER`, `PASSWORD`, `ROOT_PASSWORD`, `DATABASE`), `JWT_SECRET`, `JWT_EXPIRATION`, `API_INTERNAL_PORT`, `CORS_ORIGIN`, and `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` (passed as **build args** to the web image — `NEXT_PUBLIC_*` are baked into the bundle at build time). `NODE_ENV` is set to `production` by the Dockerfiles, not via `.env`. Note: `MARIADB_PORT` only sets the host-published port; the API always connects to the DB's internal `3306` (compose hardcodes `DATABASE_PORT: 3306`), so changing `MARIADB_PORT` won't break it.
- `api/.env.local` — API config. Under Docker, `DATABASE_*`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `CORS_ORIGIN` are injected by compose from the root `.env`; the one var that must live here is `STORAGE_PATH` (defaults to `storage`). For **local** API dev, uncomment the DB/JWT block in `api/.env.example`. `JWT_EXPIRATION` (e.g. `8h`) drives both the JWT `expiresIn` and the session cookie's `maxAge` via `durationToMs`.
- `web/.env.local` — `INTERNAL_API_URL` (server-side fetches, read at runtime) plus `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` for **local** `bun run dev` (in the Docker image these two come from the root-`.env` build args instead). See `web/src/routes.ts`.

**Formatting gotcha:** `.prettierrc` now sets `singleQuote: false` to match the double-quoted code, but still don't run `bun run format` blindly across files you didn't touch — match the surrounding style when editing.

## Comment & doc conventions

Comments are written in **Portuguese**; error/log messages and identifiers stay **English** to match existing code (e.g. `throw new NotFoundException("File not found")`). Rules differ by file type:

- **`.ts` / `.tsx`** — full **TSDoc** on public symbols: a one-line description plus `@param` (description only), `@returns`, and `@throws` where they apply. **Never put types in the JSDoc** (`@param {string}` is wrong — TypeScript already types the signature). Inline comments only for a non-obvious *why*/gotcha/unit/invariant — never narration that restates the code.
- **`.env` / `.env.example`** — a boxed file header (`# ===`) and variables grouped by category under an UPPERCASE `# LABEL`, ordered by boot flow (rede → banco → API → auth). **No per-variable comments** — the category plus the variable name carry the meaning.
- **`.yml` (compose)** — no narrative comments; rely on the structure. A genuinely non-obvious decision goes in a `CLAUDE.md`, not inline.
- **`.md`** — concise prose, no redundancy.

Reference points in the repo: the **API modules** are the model (clean, self-documenting); `web/src/**/hooks` were the anti-pattern (line-by-line narration) and are being cleaned up.

## Git / commits

- **No `Co-Authored-By` trailer** — keep authorship clean.
- **Format: `[escopo:tipo] assunto`.** Subject in **Portuguese**, lowercase, descriptive, **no action-noun** (the type carries the verb). The type lives **inside the brackets** — never a loose `tipo:` prefix.
  - **escopo** (monorepo area): `api` `web` `db` `nginx` `infra` `docs` `root`; join with `/` when it spans two (`api/web`).
  - **tipo** (EN jargon): `feat` `fix` `refactor` `docs` `chore` `perf` `test` `build`. Drop `:tipo` when the scope *is* the type (e.g. `[docs]`). Capitalize tech names in the body (NextJS, Docker, NGINX).
- **Subject ≤ ~72 chars, one line.** Detail goes in an **optional body**: blank line, then bullets (`- …`) — explain the *why*, not the file-by-file *what*.

```
[api:refactor] CQRS, rich domain e use-cases
[web:fix] real-time cross-stage e fitting verification
[db:feat] coluna document no isometric
[docs] CLAUDE.md mais conciso
```
