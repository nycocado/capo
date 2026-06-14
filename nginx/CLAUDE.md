# nginx/ — CLAUDE.md

`nginx.conf`: reverse proxy in front of the stack (container `capo-nginx`, publishes `${NGINX_PORT}:80`).

Routing:
- `/api/` → `capo-api:3002` (prefix stripped: `proxy_pass http://api/`)
- `/socket.io/` → `capo-api:3002` (WebSocket upgrade headers set)
- `/` → `capo-web:3000`

The upstream ports are hardcoded here (`capo-api:3002`, `capo-web:3000`): they must match the API's internal port (`API_INTERNAL_PORT` → `PORT`, see root `.env`) and the Next.js port (3000). Change one, change both.
