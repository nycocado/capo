# web/ — CLAUDE.md

`@capo/web`: Next.js 16 (App Router, React 19) frontend. See the root `CLAUDE.md` for the overview, domain model, and conventions; `api/CLAUDE.md` for the backend.

Contract: response shapes in `src/dtos/` mirror the API entities; the `WS_EVENTS` names (`src/routes.ts`) mirror the gateway events emitted server-side.

## Commands

```bash
bun run dev    # next dev
bun run lint   # eslint
bun run build  # next build (standalone output)
```

Path aliases: `@/*`, `@components/*`, `@hooks/*`, `@dtos/*`, `@interfaces/*`, `@constants/*`, `@styles/*`.

## Architecture

The three operator screens live under the `(factory)` route group: `cut/`, `assembly/`, `weld/`.

- **Auth/routing:** `src/proxy.ts` (Next 16's renamed middleware) runs on protected paths — reads the `token` cookie, calls `GET /auth/me`, redirects to `/login` or `/unauthorized` (page→role map; admin passes all). After login, `/` → `/roles`, the landing where the user picks a stage.
- **Server/client split:** each `page.tsx` is an async Server Component that forwards the `token` cookie to the API (via the `lib/api` server fetchers) for the initial fetch, then renders a `*Client.tsx` with that data.
- **Work-stage engine (`features/work-stage`):** the three stages share `useWorkStage<TList>` — a **light list** as a TanStack Query (seeded by the RSC prefetch via `initialData`, `staleTime: Infinity`, no background refetch) **plus a detail-on-demand query** (`[...queryKey, "detail", selectedId]` via `fetchById`). `claim`/`release` are mutations (claim seeds the detail cache); `useStageSocket` keeps both in sync. Parametrised by `WorkStageConfig<TList>` (`context`, `queryKey`, `fetchList`, `fetchById`, `claim`, `release`, `ws.{route,eventNames}`).
- **Hook composition:** each stage has a top-level `use<Stage>Workflow` composing `useWorkStage` + the stage-specific pieces (operations via `lib/api` `POST status-events`, table/grid hooks, modals). Working items derive from **`selectedDetail`** (the open order's full tree), not from the light list. `*Client.tsx` consumes the workflow hook's return.
- **Data access (`lib/api`):** all HTTP goes here. `client.ts`: `browserApi` (cookies via `credentials:"include"`, maps 401 → session-expired), `publicApi` (login), `serverApi(token)` (Cookie header for RSC/proxy). Per-resource modules export typed fetchers/mutations over `API_ROUTES`; no raw `ky` outside `client.ts`. `lib/query/keys.ts` is the query-key factory.
- **Real-time (`lib/ws`):** `useStageSocket` (inside `useWorkStage`) **invalidates** the list query on each gateway event (the server recomputes derived fields on refetch); an `onEvent` callback also invalidates the detail cache. Event names in `WS_EVENTS` mirror the gateways verbatim.
- **Routes/events:** all URLs, namespaces, and event names in `src/routes.ts` (`API_ROUTES`, `WS_ROUTES`, `WS_EVENTS`) — add them there, not inline. `/roles`: `StationCard` shows a live pending-count (`useQuery` + `useStageSocket`).
- **UI:** React-Bootstrap + SCSS (`src/styles/`), Framer Motion; shared pieces in `src/components/`.

Cross-app feature path: API module (entity/repository/service/controller/DTO, gateway if real-time) → mirror the DTO in `src/dtos/` → add to `src/routes.ts` → add a fetcher in `src/lib/api` → wire a hook into the stage's workflow.
