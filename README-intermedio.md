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
  - [Estado Atual do Projeto (Até à Sprint 8)](#estado-atual-do-projeto-até-à-sprint-8)
    - [Concluído até Agora](#concluído-até-agora)
    - [Em progresso / Pendente](#em-progresso--pendente)
  - [Dificuldades Encontradas](#dificuldades-encontradas)
  - [Próximos Passos](#próximos-passos)
  - [Conclusão](#conclusão)

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
- Desenvolver algoritmos para otimização dos processos de produção.
- Controlar a entrada e saída de materiais.

## Estado Atual do Projeto (Até à Sprint 8)  

### Concluído até Agora

- *Modelação da Base de Dados*: Estrutura criada com tabelas, dados mockados e scripts de consulta implementados.  
- *API*: Definidos e desenvolvidos os principais endpoints para os perfis de operador de corte, soldador, tubista e administrador.  
- *Página do Administrador*: Desenvolvida com sucesso, sendo a primeira interface completa e funcional.  
- *Lógica estatística inicial*: Métricas e cálculos base já foram definidos e implementados para futura visualização em dashboard.  

### Em progresso / Pendente

- *Integrações com API (Front-end)*: As ligações entre as interfaces dos perfis e o back-end ainda não foram concluídas.  
- *Páginas dos Perfis Operacionais*: Interfaces para soldador, tubista e operador de corte estão modeladas, mas não completamente implementadas.  
- *Componentes UI reutilizáveis*: A ausência destes elementos tem dificultado a padronização visual e atrasado o desenvolvimento de novas páginas.  
- *Aplicação estatística na interface*: Apesar da lógica estar feita, ainda não foi integrada ao dashboard.

## Dificuldades Encontradas

- *Compreensão do processo industrial*: No início do projeto, foi necessário estudar como funciona a linha de produção metalúrgica para conseguir desenhar funcionalidades relevantes.  
- *Organização das tarefas no tempo*: A elevada fragmentação de tarefas e dependências entre front-end e back-end dificultaram a sincronização de entregas.  
- *Integração das partes*: A ausência de componentes de interface e a demora na integração com a API geraram bloqueios que impactaram o progresso do projeto.

## Próximos Passos

Com base no planeamento e nas pendências atuais, os próximos passos incluem:

- Finalizar todas as integrações entre API e front-end.  
- Concluir as páginas dos perfis operacionais (soldador, operador, tubista).  
- Aplicar os dados estatísticos na dashboard administrativa.  
- Padronizar o visual da aplicação com os componentes reutilizáveis.

## Conclusão

O projeto **CAPO** surge como uma solução inovadora e abrangente para a gestão de produção no setor metalúrgico, especialmente voltado para empresas que atuam na fabricação e montagem de pipelines. Desenvolvido em parceria com a **[COMP (Companhia Metalúrgica Portuguesa)](https://www.metalurgicaportuguesa.pt/)**, o sistema foi concebido para modernizar e otimizar os processos produtivos, alinhando-se às necessidades de inovação e eficiência da empresa.

Com funcionalidades como gestão de produção, controle de materiais, interfaces adaptadas e otimização de processos, o **CAPO** oferece uma ferramenta robusta para acompanhar cada etapa do fluxo produtivo, desde a entrada dos materiais até a saída do produto final. As interfaces flexíveis garantem que o sistema seja intuitivo, eficiente e adaptado às necessidades de cada usuário, sejam eles operadores, administradores ou equipes de logística.
