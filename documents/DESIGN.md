<div align="center">

# Design System — `@capo/web`

A linguagem visual do CAPO — tema escuro industrial, tipografia monoespaçada e metáfora de chão de fábrica.

[![SCSS](https://img.shields.io/badge/SCSS-CC6699?logo=sass&logoColor=white)](https://sass-lang.com/)
[![React-Bootstrap](https://img.shields.io/badge/React--Bootstrap-712CF9?logo=bootstrap&logoColor=white)](https://react-bootstrap.netlify.app/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Heroicons](https://img.shields.io/badge/Heroicons-6B7280?logo=heroicons&logoColor=white)](https://heroicons.com/)
[![Geist Mono](https://img.shields.io/badge/Geist_Mono-000?logo=vercel&logoColor=white)](https://vercel.com/font)

</div>

## Visão geral

O design system do CAPO é construído sobre **React-Bootstrap + SCSS** com overrides pesados nos temas do Bootstrap para criar uma estética **dark industrial** — near-black como fundo, texturas de aço para texto secundário, e laranja (`#ff6600`) como cor única de ação e estado. A tipografia é **Geist Mono** em toda a aplicação, reforçando o caráter técnico. A metáfora visual é a **linha de produção**: o seletor de estação (`/roles`) mostra estações sobre um trilho com um tubo de aço animado por onde "escorre" o material.

A arquitetura de estilização é **três camadas**: CSS custom properties (tokens semânticos) → Bootstrap theme overrides (cores) → classes custom SCSS (componentes). Nenhuma classe Bootstrap padrão sobrevive sem customização; todos os painéis, modais, tabelas e inputs recebem a superfície escura do chão de fábrica.

## Tokens de identidade (`:root` — `globals.scss`)

Variáveis CSS globais que todas as classes custom usam — a fonte única de verdade para cores e dimensões:

| Token             | Valor     | Significado                                                                          |
| ----------------- | --------- | ------------------------------------------------------------------------------------ |
| `--navbar-height` | `72px`    | Altura da NavBar fixa; usada em `padding-top` e `calc(100vh - var(--navbar-height))` |
| `--app-bg`        | `#0d0c0c` | Fundo near-black — base de todas as telas                                            |
| `--panel`         | `#1c1a1a` | Superfície de cards/painéis                                                          |
| `--panel-edge`    | `#2c2929` | Borda hairline dos painéis                                                           |
| `--steel`         | `#6f6f6f` | Texto/ícone secundário (metáfora aço) — labels, placeholders, desabilitado           |
| `--text`          | `#ededed` | Texto principal (near-white)                                                         |
| `--accent`        | `#ff6600` | Laranja — ações primárias, estados ativos, marca                                     |

A página `/roles` reexpõe esses tokens como aliases locais (`--line-*`) dentro de `.line`.

**Regras de uso:**

- `--app-bg` → `<body>`, wrapper de layout, painéis de login, página `/roles`.
- `--panel` → superfície de todos os componentes `.op-panel` (WorkTable, WorkGrid, PDFViewer, ControlPanel).
- `--panel-edge` → `border` em `.op-panel`, separadores, bordas de células de tabela.
- `--steel` → `color` em placeholders, cabeçalhos de tabela, labels de formulário, textos secundários.
- `--text` → cor padrão de texto do corpo.
- `--accent` → borda de WorkPanel (item selecionado), `border-color` em `:focus` de inputs, hover shadow de StationCard.

## Bootstrap customizado (`bootstrap-custom.scss`)

`$accent: #ff6600` é declarado no topo do arquivo e alimenta tanto `primary` quanto `--accent` (via `#{$accent}` em `globals.scss`) e os `rgba()` em `operator.scss`/`roles.scss` — fonte única de verdade para o laranja.

8 cores de tema customizadas fundidas sobre as defaults do Bootstrap via `map-merge`:

| Chave       | Valor             | Uso                                                                  |
| ----------- | ----------------- | -------------------------------------------------------------------- |
| `primary`   | `$accent`         | Botões confirm, ações primárias, links, badges.                      |
| `secondary` | `#242222`         | Botões cancelar, estado `to-do` de rows, campos de formulário.       |
| `tertiary`  | `#616161`         | Bordas de WorkPanel cards (`border-tertiary`), estado `information`. |
| `success`   | `#26a126`         | Estado `finished`, rows confirmadas em MaterialVerificationModal.    |
| `danger`    | `#ff3838`         | Error toast, alertas, lista bloqueada (`danger` state).              |
| `info`      | `#00bfff`         | Loading alerts no FormModal.                                         |
| `light`     | Bootstrap default | Superfície clara padrão (tabs ativos).                               |
| `surface`   | `#dbdbdb`         | Superfície clara (cinza).                                            |

**Componentes Bootstrap utilizados:** `Card`, `CardBody`, `Row`, `Col`, `Table`, `Form`, `Button`, `InputGroup`, `Dropdown`, `DropdownButton`, `Modal`, `Toast`, `Spinner`, `Alert`, `Navbar`, `Nav`, `FormControl`, `FormLabel`, `FormSelect`.

## Tipografia

**Fonte:** `Geist Mono` (via `next/font/google`, variável `--font-geist-mono`, fallback `monospace`), aplicada ao `<body>` — reforça o caráter técnico.

A escala usa as classes utilitárias do Bootstrap (`display-*`, `fs-*`) para títulos e valores grandes, e tamanhos absolutos em `rem` para os elementos da metáfora de chão de fábrica:

| Onde                                          | Tamanho     |
| --------------------------------------------- | ----------- |
| Readout de valor (`ComponentLabelModal`)      | `display-1` |
| Códigos de erro (404 / 401)                   | `display-3` |
| Títulos de modal (`BaseModal` default)        | `display-4` |
| Títulos de `ConfirmModal` / `FormModal`       | `fs-1`      |
| Botões de `ControlPanel`, modais e `WorkTabs` | `fs-5`      |
| Tags em `TaggedValue` / `DoubleValue`         | `fs-6`      |
| Input de heat number (`InputModal`)           | `2.5rem`    |
| Contagem ao vivo (`StationCard`)              | `2.4rem`    |
| Nome de estação                               | `1.35rem`   |
| Cabeçalhos de tabela, labels de contagem      | `0.78rem`   |
| Número de estação                             | `0.72rem`   |
| Eyebrow de `/roles`                           | `0.8rem`    |

**Letter-spacing:** de `0.04em` (título de `/roles`) a `0.4em` (eyebrow), com `0.06em` em cabeçalhos de tabela e nomes de estação, `0.08em` em labels de contagem e `0.32em` no número de estação; os readouts grandes usam `0.5rem` (`InputModal`) e `25px` (`ComponentLabelModal`).

**Transform:** `uppercase` em cabeçalhos de tabela, nomes/numeração de estação e labels; mixed case em descrições e títulos de modal. **Weight:** `fw-semibold` na NavBar e títulos de erro; `fw-bold` em tabs ativas, títulos de modal, nomes de estação e readouts.

## Sistema de cores

### Paleta semântica

| Cor                | Hex       | Uso                                        |
| ------------------ | --------- | ------------------------------------------ |
| Near-black (fundo) | `#0d0c0c` | `--app-bg` — fundo de todas as telas       |
| Painel escuro      | `#1c1a1a` | `--panel` — superfície de cards/painéis    |
| Borda painel       | `#2c2929` | `--panel-edge` — borda hairline            |
| Aço                | `#6f6f6f` | `--steel` — texto/ícone secundário         |
| Texto claro        | `#ededed` | `--text` — texto primário                  |
| Laranja (accent)   | `#ff6600` | `$accent`/`--accent` — ações, estados, marca |
| Secundário escuro  | `#242222` | Bootstrap `secondary` — cancelar, lock, to-do |
| Terciário cinza    | `#616161` | Bootstrap `tertiary` — bordas, information |
| Sucesso verde      | `#26a126` | Bootstrap `success` — concluído            |
| Perigo vermelho    | `#ff3838` | Bootstrap `danger` — erro, bloqueado       |
| Info azul          | `#00bfff` | Bootstrap `info` — loading                 |

### Metáfora de estado

Cada item de trabalho tem um estado que define a cor da linha/card:

| Estado UI     | Classe Bootstrap          | Fundo     | Texto  | Origem                          |
| ------------- | ------------------------- | --------- | ------ | ------------------------------- |
| `to-do`       | `bg-secondary text-white` | `#242222` | Branco | `status: to_do`                 |
| `working`     | `bg-primary text-white`   | `#ff6600` | Branco | `status: in_progress`           |
| `finished`    | `bg-success text-white`   | `#26a126` | Branco | `status: done`                  |
| `information` | `bg-tertiary text-white`  | `#616161` | Branco | flag toggle manual               |
| `danger`      | `bg-danger text-white`    | `#ff3838` | Branco | lock de claim por outro usuário |

A conversão `status → UI state` é feita por `useWorkStatusAccessor`: `in_progress → working`, `done → finished`, `to_do → to-do`. O lock é verificado via `listToUiState` (`claimedBy` de outro usuário → `danger`).

## Sistema de layout

### Estrutura de páginas

**Factory pages (cut / weld):**

```
NavBar (fixed top, 72px)
└── Wrapper (overflow-auto, minHeight: 100vh, paddingTop: var(--navbar-height))
    └── Container fluid (mx-4)
        └── Row (g-4)
            ├── Col md={5} (painéis)
            │   ├── WorkPanel (detalhes do item selecionado)
            │   └── ControlPanel (busca + botões de ação)
            └── Col md={7} (dados)
                ├── WorkTabs (all / working)
                └── WorkTable (cut) ou WorkGrid (weld)
```

**Assembly page (layout invertido):**

```
NavBar (fixed top, 72px)
└── Wrapper
    └── Container fluid (mx-4)
        └── Row (g-4)
            ├── Col md={7} (mais largo) — PDF + controles
            │   ├── PDFViewer (desenho isométrico)
            │   └── ControlPanel
            └── Col md={5} (mais estreito) — dados
                ├── WorkTabs
                └── WorkGrid (joints agrupados por spool)
```

**Roles page (`/roles`):**

```
NavBar (fixed top, 72px)
└── line (flex column, center, gap clamp)
    ├── line__head (centered text)
    │   ├── line__eyebrow (uppercase, accent)
    │   ├── line__title
    │   └── line__sub
    └── line__track (max-width: 1080px, horizontal flex)
        ├── line__pipe (absoluto, metal gradient, animação flow)
        ├── StationCard × 3 (cutting, assembly, weld)
        └── Responsive: <768px → column, pipe vertical
```

**Login page:**

```
NavBar (fixed top, 72px)
└── Container fluid (vh-100, centered)
    └── Row (g-0)
        ├── Col md={7} (form) — fundo: var(--panel)
        │   ├── "Welcome Back" (display-4)
        │   ├── Form (w-50, maxWidth: 400px)
        │   │   ├── User input (op-field)
        │   │   ├── Password input (op-field)
        │   │   └── Submit (primary, w-50 mx-auto)
        │   └── Forgot Password (text-primary)
        └── Col md={5} (logo) — fundo: var(--app-bg)
```

### Padrões de espaçamento

| Padrão                           | Valor     | Uso                                    |
| -------------------------------- | --------- | -------------------------------------- |
| `g-4`                            | `1.5rem`  | Gap entre painéis em factory pages     |
| `gap-1`                          | `0.25rem` | WorkTabs tab container                 |
| `gap-4`                          | `1.5rem`  | WorkGrid grid gap                      |
| `g-0`                            | `0`       | Login row (sem gap)                    |
| `m-3` / `my-2` / `mb-2` / `mt-2` | Bootstrap | Margens entre WorkPanel cards e modais |
| `p-1`                            | `0.25rem` | WorkTabs container padding             |
| `px-5`                           | `3rem`    | Login form horizontal padding          |
| `clamp(1.5rem, 5vw, 3.5rem)`     | fluido    | Padding da roles page                  |
| `clamp(2rem, 6vh, 4rem)`         | fluido    | Gap vertical da roles page             |

### Tamanhos fixos

| Componente                     | Dimensão                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| NavBar                         | `height: 72px`                                              |
| WorkTable / WorkGrid container | `height: 400px` (scrollável)                                |
| PDFViewer                      | `height: 440px` (default)                                   |
| Station card                   | `min-height: 380px`, `min-width: 230px`, `max-width: 320px` |
| WorkGridItem button            | `height: 70px` (fixo)                                       |
| ControlPanel buttons           | `minHeight: 50px`                                           |
| Station glyph SVG              | `64px × 64px`                                               |

### Border radius

| Valor               | Onde                                         |
| ------------------- | -------------------------------------------- |
| `16px`              | Painéis (`.op-panel`), station cards, modais |
| `3px` / `rounded-3` | WorkPanel inner cards, WorkGridItem buttons  |
| `2px` / `rounded-2` | WorkTab buttons                              |

## Sistema de painéis (`.op-panel`)

Classe reutilizável em **todos** os containers de conteúdo: WorkTable, WorkGrid, ControlPanel, PDFViewer.

```scss
.op-panel {
  background: var(--panel);
  border: 1px solid var(--panel-edge);
  border-radius: 16px;
}
```

### Painel de detalhes ativo (`.op-panel--accent`)

WorkPanel usa este modificador para indicar o item selecionado — borda laranja de 2px ao redor do painel:

```scss
.op-panel--accent {
  border: 2px solid var(--accent);
}
```

### Tabela de trabalho (`.op-table`)

Override de variáveis CSS do Bootstrap para tabela escura:

```scss
.op-table {
  --bs-table-bg: transparent;
  --bs-table-color: var(--text);
  --bs-table-border-color: var(--panel-edge);
}
```

Cabeçalhos (`thead th`): `background: var(--panel)`, `color: var(--steel)`, `uppercase`, `letter-spacing: 0.06em`, `font-size: 0.78rem`, `font-weight: 600`.

Separador de grupos no grid: `<hr className="op-divider my-2">` — linha hairline horizontal.

### Scroll estilizado (`.op-scroll`)

`overflow-y: scroll` sempre visível (evita flicker de layout em animações Framer Motion), scrollbar slim com cor `--steel`:

```scss
.op-scroll {
  overflow-y: scroll;
  scrollbar-color: var(--steel) transparent;
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--steel); border-radius: 3px; }
}
```

Usada por WorkTable e WorkGrid.

## Componentes de operador

Todos os containers de conteúdo compartilham `.op-panel`; cada estágio compõe os mesmos blocos, parametrizados por estágio (colunas, cards, botões). Ver [`WEB.md`](WEB.md) para a engine que os alimenta.

- **WorkTable** — tabela ordenável dark (`op-panel op-table op-scroll`, `height: 400px`). `<motion.tbody>`/`<motion.tr>` com `layout` animam a inserção de rows e a reordenação "concluídos por último". Ordenação numérica ou `localeCompare`; ícones `BarsArrowDown`/`BarsArrowUp` (20px). Colunas sempre `text-center`, definidas por estágio em `WorkTable.columns.ts`.
- **WorkGrid** — grid de cards (`op-panel op-scroll`, `height: 400px`, `d-grid gap-4`, `repeat(n, 1fr)` default 3) com agrupamento opcional (`op-divider` entre grupos). **WorkGridItem** é um `<motion.button>` de `height: 70px`, `border-tertiary border-3`.
- **WorkPanel** — painel de detalhes do item selecionado, com a borda laranja de `op-panel--accent`. Cada card é `<Card bg="secondary" rounded-3 border-tertiary>` e exibe valores em três formas: `NormalValue`, `TaggedValue` (valor + tag) e `DoubleValue` (dois valores lado a lado). Cards centrados verticalmente (`d-flex flex-column justify-content-center`). Sem seleção: placeholder invisível mantém a altura estável; overlay "Select a row to view its details" aparece sobre os cards.
- **WorkTabs** — toggle `all` / `working` (`d-flex gap-1 p-1 bg-secondary rounded-3`, `role="tablist"`): aba ativa `bg-light text-dark`, inativa `bg-transparent text-light`.
- **ControlPanel** — `Card.op-panel` com busca (`InputGroup` + `DropdownButton` de campo + `MagnifyingGlassIcon` 23px) e botões de ação (`minHeight: 50px`, `border-3`) que variam por estágio: ações em `outline-light`, o "Next" em `primary`. Os campos buscáveis saem das colunas marcadas `searchable`.
- **PDFViewer** — visor inline do isométrico (`op-panel overflow-hidden`, `height: 440px`), com estados de loading (`Spinner`), erro (`text-danger`), carregado (`<iframe>`) e vazio ("No isometric selected.").

## Modais

Todos herdam de **BaseModal** — backdrop estático, título centralizado (`display-4 fw-bold`), sem botão de fechar, expondo `BaseModal.Body`/`BaseModal.Footer`. Os footers seguem o padrão "secundário à esquerda, primário à direita", com botões `btn-lg px-4 border-4` (cancelar `text-white`, confirmar `text-black`).

- **ConfirmModal** — confirmação simples (título `fs-1`, corpo `fs-5`); usada, por exemplo, no logout da NavBar.
- **InputModal** — entrada única com display grande (heat number): input `text-center`, `fontSize: 2.5rem`, `letter-spacing: 0.5rem`. Enter confirma, Escape fecha; em loading, backdrop fixo e botões desabilitados.
- **FormModal** — formulário multi-campo (dados de solda): `FormSelect`/`FormControl` em `form-*-lg bg-secondary text-light border-0`, labels `fs-5 fw-semibold` com asterisco `text-danger` nos obrigatórios; Alert `info` ("Loading options…") e estado vazio "No fields available".
- **ComponentLabelModal** — readout de um valor grande (`display-1`, `letter-spacing: 25px`) sobre `op-readout`, com valores secundários num card `bg-secondary` abaixo.
- **MaterialVerificationModal** — verificação de material multi-step (pipe length → fitting) na montagem: embute um `WorkTable` com `rowStates` `to-do`→`bg-secondary` e `finished`→`bg-success`, auto-scroll ao trocar de step, e footer que varia por step.

## Animação

### Framer Motion

| Componente     | Animação                                | Propósito                                   |
| -------------- | --------------------------------------- | ------------------------------------------- |
| `WorkTable`    | `<motion.tbody layout initial={false}>` | Inserção/remoção suave de rows              |
| `WorkTableRow` | `<motion.tr layout>`                    | Reordenação de rows (concluídos por último) |
| `WorkGrid`     | `<motion.div layout>`                   | Reordenação do grid                         |
| `WorkGridItem` | `<motion.button layout>`                | Reposicionamento individual                 |

Globalmente, o `MotionConfig reducedMotion="user"` respeita a preferência do sistema.

### CSS Animation — `line-flow`

Pseudo-elemento `.line__pipe::after` na roles page: gradiente (`transparent → accent → transparent`) representando material fluindo pela linha.

- Desktop: `translateX(-40%)` → `translateX(330%)` em `4.5s`, infinite, linear.
- Mobile: `translateY(-40%)` → `translateY(330%)` (`line-flow-vertical`).
- Mask nas pontas: `transparent 0% → #000 7% → #000 93% → transparent 100%`.

### Reduced motion

**globals.scss** (global):

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**roles.scss** (específico): `.line__pipe::after` com `animation: none` e `.station--active` com `transition: none`.

## Responsividade

| Breakpoint    | Comportamento                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `≥768px` (md) | Factory: split 5/7 (painéis estreitos, dados largos). Assembly: 7/5 (PDF largo). Login: 7/5.                                                       |
| `<768px`      | Roles: `line__track` empilha (`flex-direction: column`, `max-width: 360px`). Station cards: `flex: 0 0 auto`. Pipe: vira vertical (`width: 14px`). |

**Fluid sizing (clamp):**

| Propriedade   | Expression                   | Min      | Max      |
| ------------- | ---------------------------- | -------- | -------- |
| Padding roles | `clamp(1.5rem, 5vw, 3.5rem)` | `1.5rem` | `3.5rem` |
| Gap roles     | `clamp(2rem, 6vh, 4rem)`     | `2rem`   | `4rem`   |
| Gap track     | `clamp(1rem, 3.5vw, 3rem)`   | `1rem`   | `3rem`   |
| Título        | `clamp(1.8rem, 4vw, 2.6rem)` | `1.8rem` | `2.6rem` |

## Ícones

### Heroicons (todos de `@heroicons/react/16/solid`)

| Ícone                         | Tamanho | Uso                                             |
| ----------------------------- | ------- | ----------------------------------------------- |
| `MagnifyingGlassIcon`         | `23px`  | Busca no ControlPanel                           |
| `BarsArrowDownIcon`           | `20px`  | Ordenação ascendente                            |
| `BarsArrowUpIcon`             | `20px`  | Ordenação descendente                           |
| `ChevronRightIcon`            | `40×40` | Separador logo/título na NavBar                 |
| `ArrowLeftEndOnRectangleIcon` | `40×40` | Logout                                          |
| `LockClosedIcon`              | `16×16` | "Certification required" em estações bloqueadas |

### Gauge de estação (StationCard)

Cada station card exibe um medidor de contagem ao vivo no rodapé (`station__gauge`):

| Estado                           | Conteúdo                                 | Classe                                    |
| -------------------------------- | ---------------------------------------- | ----------------------------------------- |
| Não acessível (sem certificação) | Ícone cadeado + "Certification required" | `station__locked-tag`                     |
| Contagem nula                    | "—"                                      | `station__clear`                          |
| Zero pendentes                   | "All clear"                              | `station__clear`                          |
| N pendentes                      | `N` + "list(s) waiting"                  | `station__count` + `station__count-label` |

A contagem é obtida via `useQuery` com `staleTime: Infinity` + `useStageSocket` para invalidação ao vivo.

### SVG Glyphs de estação (`STATION_GLYPHS`)

Todos inline em viewBox `0 0 64 64`, `stroke="currentColor"`, `strokeWidth={3}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `aria-hidden="true"`:

| Estação         | Descrição                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Cutting**     | Círculo + linha diagonal + linha tracejada diagonal — representa lâmina de corte               |
| **Pipe-fitter** | Duas linhas horizontais + vertical + dois círculos — representa conector de tubos              |
| **Welder**      | Linha horizontal + zigzag (cordão de solda) + linhas diagonais (faíscas) — representa soldagem |

## Estado de erro e loading

### ErrorToast

Posição: `bottom-center`, `ToastContainer` dentro de `p-3`. Toast: `bg="danger"`, `autohide`, `delay={5000}`. Header: `bg-danger text-white` com label "Error".

### Loading patterns

| Componente                | Indicador                                                   |
| ------------------------- | ----------------------------------------------------------- |
| PDFViewer                 | `Spinner animation="border" variant="primary"` centralizado |
| FormModal                 | `Alert variant="info"` com `Spinner` + "Loading options..." |
| InputModal                | Botões desabilitados + spinner no confirm                   |
| MaterialVerificationModal | `Spinner` no body com "Fetching material information..."    |

### Empty states

| Componente | Mensagem                                             |
| ---------- | ---------------------------------------------------- |
| WorkPanel  | "Select a row to view its details"                   |
| PDFViewer  | "No isometric selected." (`var(--steel)`)            |
| FormModal  | "No fields available" (quando `fields.length === 0`) |

## Padrões de botões

| Padrão        | Variant                     | Texto   | Bordas      | Uso                                    |
| ------------- | --------------------------- | ------- | ----------- | -------------------------------------- |
| Confirm modal | `primary`                   | —       | `border-4`  | Confirmar ações (Bootstrap computa texto) |
| Cancel modal  | `outline-light`             | —       | `border-4`  | Cancelar / Previous                    |
| Action        | `outline-light`             | —       | `border-3`  | ControlPanel (Isometric, Note, Report) |
| Next          | `primary`                   | "Next"  | `border-3`  | Avançar no workflow                    |
| Tab active    | `bg-light text-dark`        | —       | `rounded-2` | WorkTabs                               |
| Tab inactive  | `bg-transparent text-light` | —       | `rounded-2` | WorkTabs                               |
| Login submit  | `primary`                   | "Login" | —           | `w-50 mx-auto fw-semibold`             |
| Grid item     | `border-tertiary border-3`  | —       | `border-3`  | WorkGridItem                           |

Botões de modal: `btn-lg px-4`. Botões de ControlPanel: `fs-5`, `minHeight: 50px`.

## Estados de foco

| Elemento              | Padrão                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Modal inputs          | `border-color: var(--accent)`, `box-shadow: 0 0 0 0.2rem rgba(255,102,0,0.2)`                                                        |
| Station hover         | `transform: translateY(-6px)`, `border-color: var(--accent)`, `box-shadow: 0 0 0 1px var(--accent), 0 18px 40px -22px var(--accent)` |
| Station focus-visible | `outline: 2px solid var(--accent)`, `outline-offset: 4px`                                                                            |

## Arquivos do design system

| Arquivo                            | Papel                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `src/app/globals.scss`             | Import das 3 folhas de estilo + `:root` com tokens + body font + reduced motion |
| `src/styles/bootstrap-custom.scss` | `$accent` + 8 cores customizadas do Bootstrap                                   |
| `src/styles/operator.scss`         | Estilos para telas de operador (cut/assembly/weld)                              |
| `src/styles/roles.scss`            | Estilos para seletor de estação (`/roles`)                                      |
| `src/constants/index.ts`           | `WORK_STATES` constant                                                          |
