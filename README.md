# CAPO - [IADE](https://www.iade.europeia.pt/) - [UE](https://www.europeia.pt/)

![IADE LOGO PNG](documents/logo/iade_logo.png)
**Universidade:** [Universidade Europeia](https://www.europeia.pt/)  
**Faculdade:** [IADE - Faculdade de Design, Tecnologia e Comunicação](https://www.iade.europeia.pt/)  
**Repositório:** [capo](https://github.com/nycocado/capo)  
**Curso:** Engenharia Informática

## Índice

- [CAPO - IADE - UE](#capo---iade---ue)
  - [Índice](#índice)
  - [Elementos do Grupo](#elementos-do-grupo)
  - [Versões do Relatório](#versões-do-relatório)
    - [Proposta Inicial](#proposta-inicial)
    - [Relatório Intermédio (Production Plan)](#relatório-intermédio-production-plan)
    - [Relatório Final](#relatório-final)
  - [Descrição](#descrição)
    - [Motivação](#motivação)
    - [Objetivos](#objetivos)
  - [Como utilizar o projeto](#como-utilizar-o-projeto)
    - [1. Instalar dependências da API](#1-instalar-dependências-da-api)
    - [2. Instalar dependências do Frontend](#2-instalar-dependências-do-frontend)
    - [3. Inicializar API](#3-inicializar-api)
    - [4. Inicializar a base de dados](#4-inicializar-a-base-de-dados)
    - [4. Inicializar Frontend](#4-inicializar-frontend)
    - [Observações](#observações)
      - [API](#api)
      - [WEB](#web)
  - [Principais Funcionalidades](#principais-funcionalidades)
  - [Público-Alvo](#público-alvo)
  - [Enquadramento nas Unidades Curriculares](#enquadramento-nas-unidades-curriculares)
    - [Programação Web](#programação-web)
    - [Estatística](#estatística)
    - [Interfaces e Usabilidade](#interfaces-e-usabilidade)
    - [Algoritmos e Estruturas de Dados](#algoritmos-e-estruturas-de-dados)
  - [Desafios](#desafios)
    - [Domínio de Sistemas de Produção Industrial](#domínio-de-sistemas-de-produção-industrial)
    - [Gestão Adaptativa às Demandas do Cliente](#gestão-adaptativa-às-demandas-do-cliente)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Implementações Realizadas](#implementações-realizadas)
    - [Visão Geral](#visão-geral)
    - [Áreas Principais Implementadas](#áreas-principais-implementadas)
    - [Funcionalidades Transversais](#funcionalidades-transversais)
    - [Recursos "Inteligentes"](#recursos-inteligentes)
  - [Features Previstas vs Implementadas](#features-previstas-vs-implementadas)
    - [Features Previstas na Proposta Inicial](#features-previstas-na-proposta-inicial)
    - [Features Efetivamente Implementadas](#features-efetivamente-implementadas)
      - [**Completamente Implementadas**](#completamente-implementadas)
      - [**Não Implementadas**](#não-implementadas)
  - [Conclusão](#conclusão)
  - [Anexos](#anexos)
    - [Documento de Interface e Usabilidade](#documento-de-interface-e-usabilidade)

## Elementos do Grupo

- [Nycolas Souza](https://github.com/nycocado) - 20230989
- [Luan Ribeiro](https://github.com/Ninjaok) - 20230692
- [Lohanne Guedes](https://github.com/Lohannecristina) - 20220085

## Versões do Relatório

### Proposta Inicial

- [Markdown](README-proposta.md)
- [PDF](documents/primeira_entrega/g09-proposta.pdf)

### Relatório Intermédio (Production Plan)

- [Markdown](README-intermedio.md)
- [PDF](documents/segunda_entrega/g09-production-plan.pdf)

### Relatório Final

- [Markdown](README.md)
- [PDF](documents/segunda_entrega/g09-relatorio-final.pdf)

## Descrição

O projeto **CAPO** consiste em um sistema de gestão de produção metalúrgica focado em pipelines, que permite à equipe acompanhar cada etapa do processo por meio de interfaces adaptadas à função do usuário. Idealmente, o sistema possibilita gerenciar a distribuição dos materiais desde a entrada até a saída, além de controlar as demais etapas de produção, como corte, assemblagem e soldagem.

### Motivação

No início do semestre, fomos convidados a participar de um projeto extracurricular voltado para a otimização da produção da empresa **[COMP (Companhia Metalúrgica Portuguesa)](https://www.metalurgicaportuguesa.pt/)**. A empresa, que atua no setor de produção de pipelines, está em busca de novas oportunidades para inovar e modernizar seus processos.  
Além disso, abre margem para trabalharmos na implementação de um sistema de IoT (Internet of Things) para aprimorar a gestão de materiais no ambiente produtivo, visando aumentar a eficiência e a precisão no controle de recursos.

### Objetivos

- Facilitar a gestão de produção em várias etapas do processo.
- Adaptar as interfaces para cada função do usuário.

## Como utilizar o projeto

### 1. Instalar dependências da API

```bash
cd api/
npm install
npx prisma generate
```

### 2. Instalar dependências do Frontend

```bash
cd web/
npm install
```

### 3. Inicializar API

```bash
cd api/
npm run start
```

### 4. Inicializar a base de dados

Todos os scripts necessários de create e insert da base de dados estão na pasta DB, é necessário apenas mudar as credenciais no .env da API

### 4. Inicializar Frontend

```bash
cd web/
npm run build
npm run start
```

### Observações

É necessário ter o arquivo `.env` na pasta `api` e `web`, estão com as seguintes estruturas:

#### API

```env
DATABASE_URL="mysql://root:root@localhost:3306/"
JWT_SECRET="..."
NODE_ENV="..."
PORT=3002
CORS_ORIGIN="http://localhost:3000"

STORAGE_DIR="/storage"
ISOMETRIC_DIR="/isometric/"
WPS_DIR="/wps/"
```

#### WEB

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
```

## Principais Funcionalidades

- **Gestão de Produção:** Permite o acompanhamento detalhado de cada etapa do processo produtivo, desde a entrada dos materiais até a saída do produto final. Inclui o monitoramento de operações como corte, montagem (assemblagem) e soldagem.
- **Interfaces Adaptadas:** Focado em interfaces personalizadas para cada tipo de usuário, como tubistas, soldadores, administradores e gestores. Cada perfil tem acesso a ferramentas e informações específicas para suas funções, garantindo uma experiência intuitiva e eficiente.

## Público-Alvo

O público-alvo do **CAPO** são empresas metalúrgicas que atuam na fabricação e montagem de pipelines e buscam otimizar a gestão de produção. Os principais usuários incluem:

- **Operadores:** Responsáveis por executar as etapas práticas do processo produtivo, como corte, montagem e soldagem. Eles utilizam o sistema para receber instruções claras, registar o andamento das tarefas e reportar eventuais problemas, garantindo precisão e agilidade na execução.

- **Administradores:** Responsáveis pelo controle geral da produção, os administradores utilizam o sistema para monitorar o fluxo de materiais, acompanhar o progresso das etapas de cada projeto e garantir que os recursos estejam sendo utilizados de forma eficiente. Eles têm acesso a *dashboards* e relatórios que fornecem uma visão abrangente do processo.

- **Equipe de Logística:** Profissionais encarregados da gestão de estoque, movimentação de materiais e distribuição dos produtos finais. Eles dependem do sistema para obter informações precisas sobre prazos, disponibilidade de insumos e status de entrega, garantindo que a cadeia de suprimentos funcione sem interrupções.

## Enquadramento nas Unidades Curriculares

### Programação Web

A unidade de **Programação Web** é fundamental para o desenvolvimento do sistema **CAPO**, pois envolve a criação de interfaces dinâmicas e funcionais para os usuários. Neste projeto, são aplicados conceitos como desenvolvimento front-end (HTML, Bootstrap, TypeScript) e back-end (Nest.js), além de integração com bancos de dados para armazenamento e recuperação de informações em tempo real.

### Estatística

A unidade de **Estatística** é fundamental para o **CAPO**, fornecendo métodos de coleta, organização e interpretação de dados que suportam a tomada de decisões, permitem identificar padrões e oportunidades de melhoria e apoiam a definição de estratégias para otimização de processos.

### Interfaces e Usabilidade

Em **Interfaces e Usabilidade**, o projeto **CAPO** se beneficia do design de interfaces intuitivas e adaptadas às necessidades de cada usuário. Princípios de UX (User Experience) e UI (User Interface) são aplicados para garantir que o sistema seja fácil de usar, acessível e eficiente, independentemente do perfil do usuário (operador de corte, tubista e soldador).

### Algoritmos e Estruturas de Dados

A unidade de **Algoritmos e Estruturas de Dados** é essencial para o desenvolvimento do **CAPO**, especialmente na implementação de algoritmos, em todo o sistema de autenticação e verificação de cargos dos usuários, além da lógica interna presente nas interfaces de processo, como tabelas interativas e inteligentes.

## Desafios

O desenvolvimento do projeto Capo apresentou desafios complexos que demandaram competências técnicas e gerenciais especializadas.

### Domínio de Sistemas de Produção Industrial

O principal obstáculo consistiu em compreender a arquitetura dos sistemas produtivos industriais. Este processo envolveu análise minuciosa dos processos operacionais e mapeamento dos fluxos de trabalho, garantindo que a solução desenvolvida atendesse precisamente às demandas específicas do setor industrial.

### Gestão Adaptativa às Demandas do Cliente

O segundo desafio foi gerenciar as mudanças contínuas nos requisitos do projeto. A implementação de metodologia ágil possibilitou ajustes eficientes e responsivos, assegurando alinhamento entre o produto final e as expectativas estabelecidas.

## Tecnologias Utilizadas

Para dar suporte às funcionalidades e à escalabilidade do projeto, adotamos um conjunto moderno de ferramentas e frameworks, divididos entre front-end e back-end:

- **Front-end**  
  - **React**: biblioteca para construção de interfaces reativas e componentizadas.  
  - **TypeScript**: superset do JavaScript que adiciona tipagem estática e maior segurança em tempo de desenvolvimento.  
  - **Bootstrap**: framework CSS que agiliza a criação de layouts responsivos e consistentes.  
  - **Next.js**: framework React para renderização híbrida (SSR/SSG), roteamento simplificado e otimização de performance.  
  - **Framer Motion**: biblioteca de animações para React, permitindo transições fluidas e interações avançadas.

- **Back-end**  
  - **Nest.js**: framework Node.js escalável, baseado em módulos e injeção de dependência, ideal para APIs bem estruturadas.  
  - **Prisma**: ORM moderno para TypeScript/Node.js, que facilita consultas ao banco e migrações de esquema de forma segura.  
  - **MySQL**: sistema de gerenciamento de banco de dados relacional robusto, amplamente adotado em aplicações de missão crítica.  

## Implementações Realizadas

Desenvolvemos uma plataforma completa para tornar todo o fluxo de produção digital, substituindo processos manuais (papel e planilhas) por telas interativas em tablets e computadores em cada área da fábrica. O objetivo foi garantir que qualquer operador, mesmo sem familiaridade prévia com sistemas, consiga executar tarefas de forma guiada, segura e auditável.

### Visão Geral

- **Substituição de papel e planilhas** por interfaces visuais centralizadas  
- **Atualização em tempo real** do status de cada tarefa  
- **Rastreamento histórico** de quem fez, quando fez e com que materiais  

### Áreas Principais Implementadas

1. **Corte**  
   - Lista dinâmica de itens: cores indicam "pendente", "em andamento" e "concluído".  
   - Validação obrigatória de controle de qualidade antes de avançar.  
2. **Montagem**  
   - Exibição do desenho técnico na tela.  
   - Checklist interativo que só libera a operação após verificação de todos os materiais.  
3. **Solda**  
   - Seleção guiada de processo e material de solda via dropdowns com validação de combinações válidas.  
   - Acesso instantâneo a documentos técnicos (PDF) sem papel.

### Funcionalidades Transversais

- **Controle de tarefas por papéis**: cada perfil (operador, gestor, supervisor) vê apenas o que lhe cabe.  
- **Monitoramento em tempo real**: dashboards que exibem progresso individual e geral.  
- **Notificações e alertas**: campos obrigatórios, mensagens de confirmação e bloqueios em caso de omissão.  
- **Histórico & Rastreabilidade**: registro automático de usuário e materiais usados.  
- **Segurança**: rotas protegidas por JWT, RBAC no back-end e criptografia de dados sensíveis.

### Recursos "Inteligentes"

- **Busca e ordenação automáticas** de itens conforme conclusão  
- **Seleção preditiva** do próximo trabalho ao terminar o atual  
- **Contadores e barras de progresso** com atualização imediata  
- **Validações em múltiplas etapas** para eliminar erros humanos  

Com essa implementação, transformamos a fábrica em um ambiente digital, simples de usar no dia a dia, mas robusto o bastante para garantir qualidade, eficiência e total visibilidade dos processos.

## Features Previstas vs Implementadas

### Features Previstas na Proposta Inicial

Na proposta inicial do projeto **CAPO**, foram definidas as seguintes funcionalidades principais:

- **Gestão de Produção Completa**: Acompanhamento detalhado de todas as etapas produtivas (corte, montagem, soldagem)
- **Controle Avançado de Materiais**: Sistema completo de rastreamento da matéria-prima ao produto acabado, com controle de entrada e saída
- **Interfaces Adaptadas por Perfil**: Interfaces personalizadas para tubistas, soldadores, administradores e gestores
- **Otimização de Processos**: Algoritmos para otimização da produção e descarte de materiais, com análise de dados e sugestões de melhorias
- **Análises Estatísticas Avançadas**: Indicadores de desempenho, tempo médio de execução e métricas de eficiência
- **Sistema de Informações Geográficas (SIG)**: Mapas interativos para otimização logística e distribuição

### Features Efetivamente Implementadas

O projeto conseguiu implementar aproximadamente **83%** das funcionalidades previstas, concentrando-se nas áreas mais críticas:

#### **Completamente Implementadas**

- **Digitalização da Produção**: Substituição completa de processos manuais por interfaces visuais centralizadas
- **Áreas de Produção Específicas**: Sistemas funcionais para corte (lista dinâmica com status), montagem (desenhos técnicos e checklist) e solda (seleção guiada com validação)
- **Controle de Acesso**: Sistema robusto de autenticação JWT e RBAC por perfis de usuário
- **Funcionalidades Inteligentes**: Busca automática, seleção preditiva, validações em tempo real e barras de progresso
- **Rastreabilidade**: Registro automático de operações e histórico completo de auditoria
- **Dashboard Estatístico**: Implementação completa das análises estatísticas na interface administrativa

#### **Não Implementadas**

- **Algoritmos de Otimização Avançada**: Otimização automática de processos e descarte de materiais
- **Sistema SIG**: Mapas interativos para logística e distribuição (não implementado por ser uma unidade curricular optativa no projeto)
- **Controle Completo de Estoque**: Sistema avançado de entrada/saída de materiais

A implementação priorizou a entrega de um sistema funcional e utilizável, estabelecendo uma base sólida para futuras expansões em otimização avançada e controle de estoque. A não implementação do Sistema SIG deveu-se ao facto de esta unidade curricular ser optativa no âmbito do projeto.

## Conclusão

O projeto **CAPO** surge como uma solução inovadora e abrangente para a gestão de produção no setor metalúrgico, especialmente voltado para empresas que atuam na fabricação e montagem de pipelines. Desenvolvido em parceria com a **[COMP (Companhia Metalúrgica Portuguesa)](https://www.metalurgicaportuguesa.pt/)**, o sistema foi concebido para modernizar e otimizar os processos produtivos, alinhando-se às necessidades de inovação e eficiência da empresa.

Com funcionalidades como gestão de produção, controle de materiais, interfaces adaptadas e otimização de processos, o **CAPO** oferece uma ferramenta robusta para acompanhar cada etapa do fluxo produtivo, desde a entrada dos materiais até a saída do produto final. As interfaces flexíveis garantem que o sistema seja intuitivo, eficiente e adaptado às necessidades de cada usuário, sejam eles operadores, administradores ou equipes de logística.

## Anexos

### Documento de Interface e Usabilidade

- [PDF](documents/terceira_entrega/g09-interfaces-e-usabilidade.pdf)
