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
- `web/` — `@capo/web`, a **Next.js 15** (App Router, React 19) frontend.
- `db/` — raw SQL schema + seed data (the database is **not** managed by ORM migrations).
- `nginx/` — reverse proxy: `/api/` → api, `/socket.io/` → api WebSockets, everything else → web.

> Note: the root `README.md` lists "Prisma" and "MySQL" — this is outdated. The stack is **MikroORM + MariaDB**.

## Commands

Orchestration runs from the repo root (Docker is the primary dev workflow — hot reload via volume mounts). The package manager and script runner is **Bun** (`bun.lock` is the monorepo lockfile); Node still runs the apps inside the containers. App-specific commands (test, lint, build) live in `api/CLAUDE.md` and `web/CLAUDE.md`.

```bash
bun install              # install all workspaces (writes bun.lock)
bun run docker:up        # build + start nginx, db, api, web
bun run docker:up:bg     # same, detached
bun run docker:down      # stop and remove volumes (drops the DB)
bun run docker:rebuild   # down -v then up --build (full reset, re-seeds DB)
bun run logs:api         # tail a single service (also logs:web, logs:db)
bun run exec:db          # mysql shell into the db container
bun run format           # prettier --write across the whole repo
```

## Environment / config

No `.env` files are committed (all gitignored). Three are required (templates: `.env.example` in each location):

- Root `.env` — consumed by `docker-compose.yml`: `NGINX_PORT`, `MARIADB_*` (`HOST`, `PORT`, `USER`, `PASSWORD`, `ROOT_PASSWORD`, `DATABASE`), `JWT_SECRET`, `JWT_EXPIRATION`, `NODE_ENV`, `API_INTERNAL_PORT`, `CORS_ORIGIN`. Note: `MARIADB_PORT` only sets the host-published port; the API always connects to the DB's internal `3306` (compose hardcodes `DATABASE_PORT: 3306`), so changing `MARIADB_PORT` won't break it.
- `api/.env.local` — API runtime config. Under Docker most vars (`DATABASE_*`, `JWT_SECRET`, `JWT_EXPIRATION`, `NODE_ENV`, `PORT`, `CORS_ORIGIN`) are injected by compose from the root `.env`; the one var that must live here is `STORAGE_PATH` (defaults to `storage`). `JWT_EXPIRATION` (e.g. `8h`) drives both the JWT `expiresIn` and the session cookie's `maxAge` via `durationToMs`.
- `web/.env.local` — `INTERNAL_API_URL` (server-side fetches), `NEXT_PUBLIC_API_URL` (browser fetches), `NEXT_PUBLIC_WS_URL` (socket.io). See `web/src/routes.ts`.

**Formatting gotcha:** `.prettierrc` sets `singleQuote: true`, but the committed code is double-quoted. Don't run `bun run format` blindly across files you didn't touch — it will reformat the whole tree. Match the surrounding (double-quote) style when editing.

## Comment & doc conventions

Comments are written in **Portuguese**; error/log messages and identifiers stay **English** to match existing code (e.g. `throw new NotFoundException("File not found")`). Rules differ by file type:

- **`.ts` / `.tsx`** — full **TSDoc** on public symbols: a one-line description plus `@param` (description only), `@returns`, and `@throws` where they apply. **Never put types in the JSDoc** (`@param {string}` is wrong — TypeScript already types the signature). Inline comments only for a non-obvious *why*/gotcha/unit/invariant — never narration that restates the code.
- **`.env` / `.env.example`** — a boxed file header (`# ===`) and variables grouped by category under an UPPERCASE `# LABEL`, ordered by boot flow (rede → banco → API → auth). **No per-variable comments** — the category plus the variable name carry the meaning.
- **`.yml` (compose)** — no narrative comments; rely on the structure. A genuinely non-obvious decision goes in a `CLAUDE.md`, not inline.
- **`.md`** — concise prose, no redundancy.

Reference points in the repo: the **API modules** are the model (clean, self-documenting); `web/src/**/hooks` were the anti-pattern (line-by-line narration) and are being cleaned up.

## Git / commits

- **Do NOT add a `Co-Authored-By` trailer** (no `Co-Authored-By: Claude …`) to commits in this repo — keep authorship clean.
- Commit messages are in **Portuguese**, with **no conventional-commits prefixes** (`feat:`/`fix:`/`chore:` are wrong). Use sentence-case starting with an action noun — `Adição de…`, `Correção no…`, `Atualização de…`, `Refatoração completa de…`, `Remoção de…`, `Setup do…` — optionally composed with `, além de…` / `, e …` and a parenthetical reason. Capitalize tech names (NextJS, Docker, NGINX).
