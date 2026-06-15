# web/ — CLAUDE.md

`@capo/web`: **Next.js 16** (App Router, React 19) frontend. See the root `CLAUDE.md` for the monorepo overview, environment, and comment/doc conventions, and `api/CLAUDE.md` for the backend it talks to.

The web↔API contract: response shapes in `src/dtos/` mirror the API's response DTOs, and the names in `WS_EVENTS` (`src/routes.ts`) mirror the gateway event names emitted server-side.

## Commands

Run locally inside `web/` with Bun (the Docker image is production-only — a NextJS standalone server):

```bash
bun run dev    # next dev
bun run lint   # eslint
bun run build  # next build (standalone output)
bun run test   # vitest
```

Path aliases (`tsconfig.json`): `@/*`, `@components/*`, `@hooks/*`, `@dtos/*`, `@interfaces/*`, `@constants/*`, `@styles/*`.

## Architecture

The three operator screens live under the `(factory)` route group: `cut/`, `assembly/`, `weld/`.

- **Auth/routing**: `src/proxy.ts` (NextJS 16's renamed middleware) runs on protected paths — reads the `token` cookie, calls the API's `/auth/validate` and `/auth/has-role/<role>`, and redirects to `/login` or `/unauthorized`. After login, `/` redirects to `/roles` — the landing where the user picks their stage; each stage screen is gated by the role in the proxy's page-to-role map.
- **Server/client split**: each `page.tsx` is an async Server Component that forwards the `token` cookie to the API (via `ky`) for the initial data fetch, then renders a `*Client.tsx` Client Component with that data as props.
- **Hook composition**: each stage has a top-level `use<Stage>Workflow` hook (`app/(factory)/<stage>/hooks/`) that orchestrates smaller hooks — `use<Stage>Operations` (API mutations via `ky`), table hooks, plus shared hooks from `src/hooks/` (`useWorkClientState`, `useModalState`, `useUIConfigurations`, `useWebSocket`, `useWorkListOperations`). New per-stage behavior generally means a new hook composed into the workflow hook, not changes to the page/client component.
- **Routes/events**: all API URLs, WebSocket namespaces, and socket event names are centralized in `src/routes.ts` (`API_ROUTES`, `WS_ROUTES`, `WS_EVENTS`). Add endpoints there, not as inline strings.
- **UI**: React-Bootstrap + SCSS (`globals.scss`, `src/styles/`), Framer Motion for animation. Shared presentational pieces are under `src/components/` (`common/`, `features/`, `layout/`); request/response shapes are typed in `src/dtos/`.

When adding a feature that spans both apps, the typical path is: API module (entity + repository + service + controller + DTO, gateway if real-time) → mirror the response DTO in `web/src/dtos/` → add routes/events to `web/src/routes.ts` → wire a hook into the stage's workflow hook.
