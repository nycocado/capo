<div align="center">

# Computer Aided Process Overview

![CAPO](media/logo/logo.png)

Sistema de gestão de produção de _pipelines_ metalúrgicos que rastreia peças pelos três estágios de chão de fábrica — **corte**, **montagem** e **soldagem** — com interfaces por função e atualizações em tempo real.

[![License: MIT](https://img.shields.io/badge/License-MIT-3da639.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-MVP%20%C2%B7%20prova%20de%20conceito-6f42c1)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS%2011-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white)](https://mariadb.org/)
[![MikroORM](https://img.shields.io/badge/MikroORM%207-592D8C)](https://mikro-orm.io/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

</div>

## Sobre

O **CAPO** é um sistema de chão de fábrica para uma metalúrgica de _pipelines_ (tubulação industrial). Na produção real, os tubos passam por três etapas sequenciais: são **cortados** no comprimento certo, **montados** em conjuntos (_spools_) onde as peças se unem por juntas, e essas juntas são **soldadas**. O CAPO digitaliza esse fluxo — modela a produção como uma hierarquia (`Projeto → Isométrico → Spool → Junta → Peça`), dá a cada operador uma interface dedicada à sua função, e acompanha cada peça do início ao fim com rastreabilidade total e sincronização em tempo real entre as estações.

> [!NOTE]
> Este é um **MVP / prova de conceito** — uma visão de como a plataforma poderia funcionar, não um produto em produção. Foi desenvolvido em contexto académico e inspirado num caso real da **[COMP — Companhia Metalúrgica Portuguesa](https://www.metalurgicaportuguesa.pt/)**; não há intenção de evolução para além deste protótipo.

## Demonstração

O ganho central em ação — quando um estágio é concluído, o seguinte abre sozinho, em tempo real, sem recarregar a página:

<div align="center">

![Liberação de estágio em tempo real](media/gifs/04-gating.gif)

_O operador conclui o corte de um isométrico e a ordem de montagem surge na estação seguinte — `ALL CLEAR` → `1 LIST WAITING` — propagada por WebSocket._

</div>

**Corte** — operador marca tubos e regista heat numbers

![Workflow de corte](media/gifs/01-cut-workflow.gif)

**Montagem** — pipe-fitter verifica materiais e conclui juntas

![Workflow de montagem](media/gifs/02-assembly-workflow.gif)

**Soldagem** — soldador regista WPS e material de enchimento

![Workflow de soldagem](media/gifs/03-weld-workflow.gif)

## Como funciona

O fluxo da aplicação espelha o do chão de fábrica, do login à peça concluída:

1. **Autenticação e estações.** O operador entra com as suas credenciais e chega ao painel de estações. Cada estação corresponde a um estágio — corte, montagem ou soldagem — e só fica acessível a quem tem o papel correspondente (`cutting-operator`, `pipe-fitter`, `welder`); um **administrador** vê e opera todas. A sessão é mantida por um JWT guardado num cookie `httpOnly`.

2. **Reivindicar uma ordem (_claim_).** Na sua estação, o operador escolhe uma ordem de trabalho disponível e a reivindica. A partir desse momento a ordem fica **travada** para si: mais ninguém — exceto um administrador — pode avançar os seus itens, o que evita que duas pessoas trabalhem na mesma peça ao mesmo tempo.

3. **Avançar os itens.** Cada item percorre uma máquina de estados (`a fazer → em progresso → concluído`), registando o dado que aquele estágio exige: o _heat number_ do material no corte, o _filler material_ e a _WPS_ na soldagem. O operador consulta na própria interface o desenho do isométrico e os documentos técnicos em PDF. Cada transição é gravada numa **trilha imutável de eventos** — quem fez, o quê e quando.

4. **Liberação do próximo estágio (_gating_).** Quando todos os itens de uma ordem ficam concluídos, o estágio seguinte abre sozinho: concluído o corte de um isométrico, a sua montagem fica disponível; concluída a montagem, abre a soldagem. Esse encadeamento é **calculado a partir do estado das peças**, nunca armazenado — por isso não há como ficar dessincronizado.

5. **Sincronização em tempo real.** Assim que uma ordem é liberada, ela surge para o operador do estágio seguinte **sem recarregar a página**: as mudanças de estado e de _claim_ são propagadas entre as estações por WebSocket.

## Destaques técnicos

- **Domínio rico + CQRS** — as regras de negócio (máquinas de estado, invariantes de _claim_) vivem nas próprias entidades; cada ação é um _use-case_ isolado, despachado sobre os _buses_ de comando e consulta.
- **Estado derivado, não duplicado** — o progresso de uma ordem e o _gating_ entre estágios são calculados na consulta, a partir do estado das peças; não existe um campo "status da ordem" para dessincronizar.
- **Histórico _append-only_** — cada transição de item é um evento imutável, formando uma trilha de auditoria completa (quem, o quê e quando).
- **Tempo real desacoplado** — os _domain events_ são publicados pós-commit num `EventBus` e projetados nos sockets de cada estágio, sem que a lógica de negócio conheça WebSocket.
- **Concorrência segura** — reivindicar uma ordem usa _lock_ pessimista, então dois operadores a competir pela mesma lista nunca corrompem o estado.
- **Segurança** — JWT em cookie `httpOnly`, controlo de acesso por papel, _helmet_, _rate-limiting_ configurável, e os documentos (PDF) servidos com proteção contra _path traversal_.

## Arquitetura

O sistema é um monorepo **Bun workspaces** com quatro peças, todas atrás de um reverse proxy **NGINX** e orquestradas por **Docker/Podman Compose**. O NGINX é a única porta de entrada: encaminha `/api/` e `/socket.io/` para a API e todo o resto para o front-end, de modo que o browser e a API conversam sempre pela mesma origem.

| Pasta    | Aplicação                                                                   |
| -------- | --------------------------------------------------------------------------- |
| `api/`   | `@capo/api` — NestJS 11 com **CQRS** e domínio rico, MikroORM sobre MariaDB |
| `web/`   | `@capo/web` — Next.js 16 (App Router, React Server Components)              |
| `db/`    | schema + seed em **SQL puro** (a base não é gerida por migrações de ORM)    |
| `nginx/` | reverse proxy — roteia `/api/`→api, `/socket.io/`→api, `/`→web              |

**No backend**, cada operação percorre o caminho do CQRS: o _controller_ é fino — só valida o papel do operador e despacha a mensagem — enquanto um _command_ ou _query handler_ executa o caso de uso dentro de uma transação. As regras de negócio (máquinas de estado, invariantes do _claim_) não ficam espalhadas em serviços: vivem nas próprias **entidades de domínio**, que são as únicas a decidir se uma transição é válida. Concluída a transação, a entidade emite os seus _domain events_, publicados **pós-commit** num `EventBus`; do outro lado, _projections_ escutam esses eventos e os retransmitem pelo socket do estágio correspondente. É esse desacoplamento que mantém a lógica de negócio sem nunca precisar saber o que é um WebSocket.

**No front-end**, cada tela de estágio começa como um _React Server Component_ que já busca os dados iniciais com o cookie da sessão e os entrega hidratados ao cliente; a partir daí o TanStack Query cuida do cache e o socket apenas **invalida** a lista quando algo muda no servidor — que recalcula o estado derivado (progresso, _gating_) no próximo _refetch_. O estado nunca é duplicado entre cliente e servidor: o servidor é a fonte da verdade e o cliente só o reflete.

## Stack

| Camada       | Tecnologias                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript, React-Bootstrap + SCSS, Framer Motion, TanStack Query, socket.io-client |
| **Backend**  | NestJS 11 (CQRS), MikroORM 7, MariaDB, Socket.IO, Passport/JWT                                            |
| **Infra**    | Bun (workspaces + runtime), Docker/Podman Compose, NGINX                                                  |
| **Testes**   | Jest, Supertest, Testcontainers, GitHub Actions                                                           |

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

O código não carrega documentação inline — por opção de projeto, é o **conjunto de testes que fixa o comportamento esperado** (um teste é executável e nunca apodrece; um comentário, sim). A API é coberta por testes **Jest** em dois níveis, ambos executados no CI a cada _push_ (GitHub Actions):

```bash
cd api
bun run test       # unidade — domínio puro: máquinas de estado, invariantes de claim e política de lock, sem I/O
bun run test:e2e   # e2e — boot real da app contra um MariaDB efémero (Testcontainers): autenticação + gating
```

Os testes de **unidade** exercitam as entidades de domínio isoladamente — rápidos, sem banco. Os **e2e** sobem um MariaDB descartável num container (via Testcontainers), aplicam o schema real e validam o fluxo HTTP de ponta a ponta, incluindo a liberação de um estágio para o seguinte. O front-end não tem suíte própria: é uma casca sobre a API, verificada por _smoke_ manual end-to-end.

## Estrutura do monorepo

```
capo/
├── api/                @capo/api — NestJS + MikroORM (CQRS, domínio rico)
├── web/                @capo/web — Next.js (App Router, RSC)
├── db/                 schema + seed (SQL puro)
├── nginx/              reverse proxy
├── media/              assets do projeto (logo)
├── documents/          documentação de projeto
└── docker-compose.yml  orquestração da stack completa
```

## Documentação

Documentação técnica por subsistema, em [`documents/`](documents/):

- [**Frontend — `@capo/web`**](documents/WEB.md) — arquitetura do Next.js: _work-stage engine_, camada de dados, tempo real e variações por estágio.

## Desenvolvedores

- [Nycolas Souza](https://github.com/nycocado)
- [Luan Ribeiro](https://github.com/Ninjaok)
- [Lohanne Guedes](https://github.com/lohanneguedes)

## Licença

Distribuído sob a licença **MIT**, © 2025 Nycolas Souza.

É uma licença permissiva: qualquer pessoa pode usar, copiar, modificar e distribuir o código, inclusive em projetos comerciais, desde que mantenha o aviso de copyright e o texto da licença.

O software é fornecido "como está", sem garantias. O texto completo está em [LICENSE](LICENSE).
