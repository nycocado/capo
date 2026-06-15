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
- **Server/client split**: each `page.tsx` is an async Server Component that forwards the `token` cookie to the API (via the `lib/api` server fetchers) for the initial data fetch, then renders a `*Client.tsx` Client Component with that data as props.
- **Work-stage engine (`features/work-stage`)**: the three stages share `useWorkStage<TList>` (`features/work-stage/useWorkStage.ts`), the generic server+UI core — the list as a TanStack Query (`useQuery`, seeded by the RSC prefetch via `initialData`, `staleTime:Infinity`, no background refetch), `useStageSocket` for real-time, `useMutation` for set-working (→ `setQueryData`), and shared UI state (active tab, search, search field, error). It's parametrised by a `WorkStageConfig<TList>` (`features/work-stage/types.ts`: `context`, `queryKey`, browser `fetchToDo`/`setWorking`, and `ws.events` mapping each gateway event to a cache transform).
- **Hook composition**: each stage has a top-level `use<Stage>Workflow` hook (`app/(factory)/<stage>/hooks/`) that calls `useWorkStage` for the data/UI core and composes the genuinely stage-specific pieces — `use<Stage>Operations` / the verification hooks (step mutations via `lib/api`), table hooks, the working view (cut: pipe-length table; assembly/weld: a `WorkGrid`), and modals. The working items are **derived from the cached list** (cut's pipe-lengths via `extractPipeLengthsFromCutList`; the selected assembly/weld list via `items.find(selectedId)`), and a step's result is merged back into the list cache (`mergePipeLengthIntoCutLists` / `mergeWeldIntoWeldLists`) since an intermediate step doesn't emit a list-level WS event. The `*Client.tsx` consumes the workflow hook's return; new per-stage behavior is a new hook composed into the workflow hook.
- **Data access (`lib/api`)**: all HTTP goes through `src/lib/api` (Fase 1 of the refactor). `client.ts` exposes `browserApi` (sends cookies via `credentials:"include"`; maps 401 → `SESSION_EXPIRED_MESSAGE` in a `beforeError` hook), `publicApi` (login — a 401 there means bad credentials, so it skips the session-expired mapping), and `serverApi(token)` (injects the `Cookie` header for RSC/proxy fetches). Per-resource modules (`auth`, `users`, `roles`, `cut-lists`, `assembly-lists`, `weld-lists`, `pipe-lengths`, `joints`, `welds`, `wps`, `filler-materials`, `documents`) export typed fetchers/mutations over those clients + `API_ROUTES`; import them from `@/lib/api`. No raw `ky` outside `client.ts`. `src/lib/query/keys.ts` holds the TanStack Query key factory (`queryKeys`), consumed by `useWorkStage` for the per-stage list cache.
- **Real-time as cache sync (`lib/ws`)**: `socket.ts` exposes `createStageSocket(route)` (socket.io factory) and `useStageSocket` is the generic hook (called inside `useWorkStage`) that replaced the old `useWebSocket` — it maps each gateway event to a `queryClient.setQueryData` on the list's `queryKey`, using the pure list helpers in `src/domain/logic/upsertById.ts` (`upsertById`/`upsertManyById`/`replaceById`: update events use `replaceById`, single-entity creates use `upsertById`, array creates use `upsertManyById`). Per-stage event→transform mapping lives in each `WorkStageConfig.ws.events`. The event *names* in `WS_EVENTS` must mirror the gateways verbatim (note `weld-list` emits `createsWeldList` with an **array** payload — don't "normalize" that value).
- **Routes/events**: all API URLs, WebSocket namespaces, and socket event names are centralized in `src/routes.ts` (`API_ROUTES`, `WS_ROUTES`, `WS_EVENTS`). Add endpoints there, not as inline strings.
- **UI**: React-Bootstrap + SCSS (`globals.scss`, `src/styles/`), Framer Motion for animation. Shared presentational pieces are under `src/components/` (`common/`, `features/`, `layout/`); request/response shapes are typed in `src/dtos/`.

When adding a feature that spans both apps, the typical path is: API module (entity + repository + service + controller + DTO, gateway if real-time) → mirror the response DTO in `web/src/dtos/` → add routes/events to `web/src/routes.ts` → add a fetcher/mutation in `web/src/lib/api` → wire a hook into the stage's workflow hook.
