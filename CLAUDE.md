# CLAUDE.md

CAPO (Computer Aided Process Overview) — a metallurgical pipeline-production management system. It tracks parts through three shop-floor stages — **cut**, **assembly**, **weld** — with role-specific operator interfaces and real-time updates.

Bun-workspaces monorepo (package manager **Bun**, `bun.lock`) behind an nginx reverse proxy, via Docker/Podman Compose:
- `api/` — `@capo/api`, NestJS 11 + MikroORM + MariaDB. See `api/CLAUDE.md`.
- `web/` — `@capo/web`, Next.js 16 (App Router, React 19). See `web/CLAUDE.md`.
- `db/` — schema + seed in raw SQL (the DB is **not** managed by ORM migrations). See `db/CLAUDE.md`.
- `nginx/` — reverse proxy (`/api/`→api, `/socket.io/`→api, `/`→web). See `nginx/CLAUDE.md`.

Each nested `CLAUDE.md` is loaded when working in its folder. **Principle:** this root holds what is global (domain model, conventions, commands); the nested ones hold only their area's specifics, without repeating — they reference, they don't duplicate.

## Domain model (canonical)

```
Project → Isometric → Spool → Joint → (part1, part2 : Part)   and   Joint → Weld
Part = PipeLength | Fitting   (joined-table inheritance, shared PK)
Fitting → Port
```
`isometric.document` holds the drawing PDF (no sheet/rev — those concepts were dropped).

Three stages, each a work order tracking one item type:
- **cut** → `cut_list` (1:1 isometric), tracks **pipe_lengths** (`to_do→in_progress→done`; `in_progress` captures `heat_number`).
- **assembly** → `assembly_list` (1:1 isometric), tracks **joints** (`to_do→done`).
- **weld** → `weld_list` (1:1 spool), tracks **welds** (`to_do→done`; captures `filler_material`+`wps`).

Each item has a denormalized `status` (native ENUM) **plus** an append-only `<item>_status_event` trail. Lists store **no** status — progress and gating (prior stage complete) are **derived** from the items. Each list has `claimed_by`/`claimed_at` = **exclusive lock** (only the claimer or an admin advances its items). Roles: `cutting-operator`→cut, `pipe-fitter`→assembly, `welder`→weld, `administrator`→everything.

## Working in this repo

- **Filter in the query, not in JS:** always filter and aggregate in the DB query (repository `WHERE`/QueryBuilder, `count`/`getCount`) — never load rows and discard them with `.filter()`/`.length`. The DB does the work; the frontend renders what the API returns. If a row shouldn't appear, the query shouldn't return it.
- **No documentation in code:** zero JSDoc, zero narrative comments (see "Comments & docs"). A well-named, strictly-typed symbol documents itself; a non-obvious rule becomes a **test**, not a comment; architecture lives in the `CLAUDE.md` files.
- **Subagents and skills:** delegate parallel/repetitive or context-heavy work to subagents (Agent) (UI smoke, broad sweeps, per-file migrations); invoke skills (`/<name>`) when a task matches. Prefer a Sonnet subagent for mechanical/verbose work.

## Commands

Orchestration runs from the root via Bun (scripts in `package.json`: `docker:up`/`down`/`rebuild`, `logs:*`, `exec:db`, `format`). Compose builds **production images** (multi-stage builder/runner; web = standalone `node server.js`, api = `node dist/main`, both non-root). Day-to-day dev runs **locally with Bun** against the Dockerized DB (no hot-reload-in-container). Per-app commands live in `api/CLAUDE.md` and `web/CLAUDE.md`.

Rebuild gotcha (Podman): `compose up --build` **caches** and may run a stale image — use `compose build --no-cache <svc>` + `up -d --force-recreate` when a change doesn't show up.

## Environment / config

Three `.env` files (gitignored; templates `.env.example` in each location): root (consumed by `docker-compose.yml`), `api/.env.local`, `web/.env.local`. Per-variable detail: see the `.env.example` files. Non-obvious gotchas:
- `NEXT_PUBLIC_*` are **build args** baked into the web bundle (fixed at build time, not runtime).
- `MARIADB_PORT` only publishes the host port; the API connects to the internal `3306` (compose hardcodes `DATABASE_PORT: 3306`).
- `JWT_EXPIRATION` (e.g. `8h`) drives both the JWT `expiresIn` and the cookie `maxAge` (via `durationToMs`).
- `.prettierrc` sets `singleQuote: false`; don't run `bun run format` across files you didn't touch.

## Comments & docs

**No documentation in code** — zero JSDoc, zero narrative comments, in both apps. This is deliberate: a doc-comment isn't compiled or tested, so it drifts and ends up lying — and a stale comment is worse than none. A strictly-typed symbol with a good name already says *what*; the *why* belongs in a **test that locks the behavior** (executable, never rots) or in a clearer structure — not in prose next to the code. Architecture and structure live in the `CLAUDE.md` files. By file type:
- **`.ts`/`.tsx`** — no JSDoc, no inline `//`/`/* */`. The only survivors are **tool directives** (`// eslint-disable`, `// @ts-*`), which aren't documentation. Identifiers and error/log messages stay in **English**.
- **`.env`** — boxed header (`# ===`), variables grouped by UPPERCASE category in boot order; no per-variable comments.
- **`.yml`/compose** — no narrative comments; a non-obvious decision goes in a `CLAUDE.md`.
- **`.md`** — concise prose, no redundancy.

## Git / commits

- **No `Co-Authored-By` trailer** — keep authorship clean.
- **Format: `[scope:type] subject`.** Subject in **Portuguese**, lowercase, descriptive, **no action-noun** (the type carries the verb). The type lives **inside the brackets** — never a loose `tipo:` prefix.
  - **scope** (monorepo area): `api` `web` `db` `nginx` `infra` `docs` `root`; join with `/` when it spans two (`api/web`).
  - **type** (EN jargon): `feat` `fix` `refactor` `docs` `chore` `perf` `test` `build`. Drop `:type` when the scope *is* the type (e.g. `[docs]`). Capitalize tech names in the body (NextJS, Docker, NGINX).
- **Subject ≤ ~72 chars, one line** — usually all it needs. Add a body **only** when the *why* genuinely requires it (the exception, not the rule), and keep it to a couple of short bullets — never a file-by-file list.

```
[api:refactor] CQRS, rich domain e use-cases
[web:fix] real-time cross-stage e fitting verification
[db:feat] coluna document no isometric
[docs] CLAUDE.md mais conciso
```
