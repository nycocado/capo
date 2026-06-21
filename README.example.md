<div align="center">


# CAPO

<img src="media/logo/logo.png" alt="CAPO"/>

**Computer Aided Process Overview** — sistema de gestão de produção de _pipelines_ metalúrgicos que rastreia peças pelos três estágios de chão de fábrica — **corte**, **montagem** e **soldagem** — com interfaces por função e atualizações em tempo real.

[![License: MIT](https://img.shields.io/badge/License-MIT-3da639.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-f5a623)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS%2011-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white)
![MikroORM](https://img.shields.io/badge/MikroORM%207-592D8C)
![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)

</div>

---

## Sobre

O **CAPO** é um sistema interno de chão de fábrica para uma metalúrgica de _pipelines_. Modela a produção como uma hierarquia (`Projeto → Isométrico → Spool → Junta → Peça`) e acompanha cada peça por três estágios sequenciais, cada um com a sua ordem de trabalho, interface dedicada e papel de operador.

> Projeto desenvolvido em contexto académico, inspirado num caso real da **[COMP — Companhia Metalúrgica Portuguesa](https://www.metalurgicaportuguesa.pt/)**.

## Funcionalidades

- **Três estágios** — corte (`pipe_lengths`), montagem (`joints`) e soldagem (`welds`); cada item avança por uma máquina de estados (`to_do → in_progress → done`), capturando dados próprios do estágio (heat number no corte; filler material + WPS na soldagem).
- **Lock exclusivo (claim)** — cada ordem é reivindicada por um operador; só o _claimer_ (ou um administrador) avança os seus itens.
- **Gating entre estágios** — a montagem de um isométrico só abre quando o corte termina; a soldagem, quando a montagem termina. Derivado na consulta, não armazenado.
- **Rastreabilidade** — cada transição gera um evento _append-only_ (trilha imutável de quem fez o quê e quando).
- **Tempo real** — eventos de status e claim propagados por WebSocket (Socket.IO): o estágio seguinte é notificado assim que o anterior libera trabalho.
- **Controlo de acesso** — papéis `cutting-operator`, `pipe-fitter`, `welder` e `administrator` (este acede a tudo); autenticação por JWT em cookie `httpOnly`.
- **Documentos** — PDFs de isométricos e WPS servidos sob demanda, com proteção contra _path traversal_.

## Arquitetura

Monorepo **Bun workspaces** atrás de um reverse proxy **NGINX**, orquestrado por **Docker/Podman Compose**:

| Pasta     | Aplicação                                                                       |
| --------- | ------------------------------------------------------------------------------- |
| `api/`    | `@capo/api` — NestJS 11 com **CQRS** e domínio rico, MikroORM sobre MariaDB      |
| `web/`    | `@capo/web` — Next.js 16 (App Router, React Server Components)                   |
| `db/`     | schema + seed em **SQL puro** (a base não é gerida por migrações de ORM)         |
| `nginx/`  | roteia `/api/`→api, `/socket.io/`→api, `/`→web                                   |

As regras de negócio (máquinas de estado, invariantes de claim) vivem nas **entidades**; os _use-cases_ são _handlers_ CQRS finos; eventos de domínio são publicados pós-commit num `EventBus` e projetados nos sockets de cada estágio.

## Stack

| Camada       | Tecnologias                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript, React-Bootstrap + SCSS, Framer Motion, TanStack Query, socket.io-client |
| **Backend**  | NestJS 11 (CQRS), MikroORM 7, MariaDB, Socket.IO, Passport/JWT                         |
| **Infra**    | Bun (workspaces + runtime), Docker/Podman Compose, NGINX                               |
| **Testes**   | Jest, Supertest, Testcontainers, GitHub Actions                                       |

## Como executar

### Pré-requisitos

- [Bun](https://bun.sh)
- [Docker](https://www.docker.com/) + Docker Compose (ou Podman com o shim `docker compose`)

### Configuração

Nenhum `.env` é versionado. Crie os três a partir dos templates `.env.example`:

- `.env` (raiz) — consumido pelo Docker Compose (rede, banco, JWT, CORS, `NEXT_PUBLIC_*`).
- `api/.env.local` — configuração da API.
- `web/.env.local` — URLs da API para o desenvolvimento local.

### Stack completa (Docker)

```bash
bun install          # instala todos os workspaces
bun run docker:up    # build + sobe nginx, db, api e web
```

Disponível em `http://localhost:<NGINX_PORT>` (default `8080`).

### Desenvolvimento local

As aplicações rodam localmente com Bun, contra o banco no container:

```bash
cd api && bun run start:dev  # NestJS em watch mode
cd web && bun run dev        # Next.js dev server (hot reload)
```

Outros: `bun run docker:down` (derruba + remove volumes), `bun run docker:rebuild` (reset + re-seed), `bun run logs:api|web|db`.

## Testes

A API é coberta por testes **Jest** (correm no CI via GitHub Actions):

```bash
cd api
bun run test       # unidade — domínio puro (máquinas de estado, claim, política de lock), sem I/O
bun run test:e2e   # e2e — boot real contra um MariaDB efémero (Testcontainers): auth + gating entre estágios
```

O front-end não tem suíte própria (é casca sobre a API; a sua verificação é por _smoke_ end-to-end).

## Estrutura do monorepo

```
capo/
├── api/                @capo/api — NestJS + MikroORM (CQRS, domínio rico)
├── web/                @capo/web — Next.js (App Router, RSC)
├── db/                 schema + seed (SQL)
├── nginx/              reverse proxy
├── media/              assets (logo)
├── documents/          documentação de projeto (design system, decisões de arquitetura)
└── docker-compose.yml
```

## Desenvolvedores

- [Nycolas Souza](https://github.com/nycocado)
- [Luan Ribeiro](https://github.com/Ninjaok)
- [Lohanne Guedes](https://github.com/Lohannecristina)

## Licença

Distribuído sob a licença **MIT** — ver [LICENSE](LICENSE).
