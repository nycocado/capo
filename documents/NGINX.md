<div align="center">

# Reverse Proxy — `nginx`

O ponto de entrada único do CAPO — roteamento de tráfego HTTP e WebSocket para a API e para o web.

[![NGINX](https://img.shields.io/badge/NGINX-009639?logo=nginx&logoColor=white)](https://nginx.org/)

</div>

## Visão geral

O container `capo-nginx` publica `${NGINX_PORT}:80` e despacha o tráfego para dois upstreams internos:

| Upstream  | Destino           |
| --------- | ----------------- |
| `api`     | `capo-api:3002`   |
| `web`     | `capo-web:3000`   |

As portas internas são hardcoded no `nginx.conf` e devem ser mantidas em sincronia com `API_INTERNAL_PORT` (→ `PORT`) no `.env` da API e com a porta padrão do Next.js (3000).

## Roteamento

| Prefixo       | Upstream | Observação                                      |
| ------------- | -------- | ----------------------------------------------- |
| `/api/`       | `api`    | Prefixo removido na passagem (`proxy_pass http://api/`) |
| `/socket.io/` | `api`    | WebSocket upgrade; sem remoção de prefixo       |
| `/`           | `web`    | Catch-all para o Next.js                        |

`/api/` e `/` usam `Connection ""` — necessário para que o keepalive HTTP/1.1 funcione no upstream. `/socket.io/` envia `Upgrade: $http_upgrade` + `Connection: "upgrade"` e tem `proxy_read_timeout 3600s`, pois conexões WebSocket são longas (o padrão de 60s as derrubaria).

## Keepalive

Cada upstream mantém um pool de **32 conexões keepalive** (`keepalive 32`). Os blocos de localização HTTP usam `proxy_http_version 1.1` + `Connection ""` para reutilizar essas conexões sem que o nginx feche o soquete a cada requisição.

## Compressão

Gzip ativado para respostas com mais de 1 KB dos tipos: `text/plain`, `text/css`, `application/json`, `application/javascript`, `text/xml`, `application/xml`. `gzip_proxied any` aplica mesmo quando o upstream já respondeu para um cliente que declarou aceitar gzip.

## Timeouts e limites

| Diretiva                | Valor   | Aplicação                     |
| ----------------------- | ------- | ----------------------------- |
| `client_max_body_size`  | 1 MB    | Uploads HTTP (ex.: PDFs)      |
| `proxy_connect_timeout` | 10 s    | Conexão ao upstream           |
| `proxy_send_timeout`    | 30 s    | Envio de dados ao upstream    |
| `proxy_read_timeout`    | 30 s    | Resposta HTTP do upstream     |
| `proxy_read_timeout`    | 3600 s  | Somente `/socket.io/` (WS)   |

## Headers de segurança

Adicionados em todas as respostas (`always`):

| Header                    | Valor                              |
| ------------------------- | ---------------------------------- |
| `X-Frame-Options`         | `SAMEORIGIN`                       |
| `X-Content-Type-Options`  | `nosniff`                          |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`  |

`server_tokens off` remove a versão do NGINX do header `Server`.

Os headers de segurança da API (`helmet()`) são complementares a estes e não duplicados aqui.
