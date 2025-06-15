# CAPO - Computer Aided Process Overview

![Logo CAPO](/documents/logo/logo.png)

## Desenvolvedores

- [Nycolas Souza](https://github.com/nycocado)
- [Luan Ribeiro](https://github.com/Ninjaok)
- [Lohanne Guedes](https://github.com/Lohannecristina)

## Descrição

O projeto **CAPO** consiste em um sistema de gestão de produção metalúrgica focado em pipelines, que permite à equipe acompanhar cada etapa do processo por meio de interfaces adaptadas à função do usuário. Idealmente, o sistema possibilita gerenciar a distribuição dos materiais desde a entrada até a saída, além de controlar as demais etapas de produção, como corte, assemblagem e soldagem.

### Motivação

A **[COMP (Companhia Metalúrgica Portuguesa)](https://www.metalurgicaportuguesa.pt/)**, empresa do setor de produção de pipelines, identificou a necessidade estratégica de modernizar e otimizar seus processos produtivos para manter sua competitividade no mercado global. Com o crescente aumento da demanda por eficiência operacional e rastreabilidade total na indústria metalúrgica, a COMP reconheceu que seus sistemas tradicionais de gestão de produção apresentavam limitações que impactavam diretamente na produtividade, controle de qualidade e gestão de materiais.

A empresa busca implementar uma solução tecnológica robusta que proporcione visibilidade em tempo real de todos os processos produtivos, redução de desperdícios através de controle preciso de materiais, melhoria na rastreabilidade desde a matéria-prima até o produto final, otimização dos fluxos de trabalho nas estações de corte, montagem e soldagem, e integração com tecnologias IoT para monitoramento inteligente do ambiente produtivo.

Esta modernização representa um investimento estratégico essencial para posicionar a COMP na vanguarda da transformação digital da indústria, garantindo maior competitividade, qualidade superior dos produtos e capacidade de resposta às exigências crescentes do mercado de pipelines, além de estabelecer as bases para futuras expansões e adaptações às demandas tecnológicas do setor metalúrgico.

### Objetivos

- Facilitar a gestão de produção em várias etapas do processo.
- Adaptar as interfaces para cada função do usuário.
- Desenvolver algoritmos para otimização dos processos de produção.
- Controlar a entrada e saída de materiais.

## Principais Funcionalidades

- **Gestão de Produção:** Permite o acompanhamento detalhado de cada etapa do processo produtivo, desde a entrada dos materiais até a saída do produto final. Inclui o monitoramento de operações como corte, montagem (assemblagem) e soldagem.
- **Controle de Materiais:** Oferece um sistema completo de rastreamento de materiais, da matéria-prima ao produto acabado. Cada material é registado e monitorado em todas as etapas da produção, criando um histórico detalhado de utilização.
- **Interfaces Adaptadas:** Focado em interfaces personalizadas para cada tipo de usuário, como tubistas, soldadores, administradores e gestores. Cada perfil tem acesso a ferramentas e informações específicas para suas funções, garantindo uma experiência intuitiva e eficiente.
- **Otimização de Processos:** Análise de dados e sugestões de melhorias contínuas para aumentar a eficiência, reduzir desperdícios e garantir a qualidade dos produtos finais, com foco em etapas como corte, montagem e soldagem.

## Público-Alvo

O público-alvo do **CAPO** são empresas metalúrgicas que atuam na fabricação e montagem de pipelines e buscam otimizar a gestão de produção. Os principais usuários incluem:

- **Operadores:** Responsáveis por executar as etapas práticas do processo produtivo, como corte, montagem e soldagem. Eles utilizam o sistema para receber instruções claras, registar o andamento das tarefas e reportar eventuais problemas, garantindo precisão e agilidade na execução.

- **Administradores:** Responsáveis pelo controle geral da produção, os administradores utilizam o sistema para monitorar o fluxo de materiais, acompanhar o progresso das etapas de cada projeto e garantir que os recursos estejam sendo utilizados de forma eficiente. Eles têm acesso a *dashboards* e relatórios que fornecem uma visão abrangente do processo.

- **Equipe de Logística:** Profissionais encarregados da gestão de estoque, movimentação de materiais e distribuição dos produtos finais. Eles dependem do sistema para obter informações precisas sobre prazos, disponibilidade de insumos e status de entrega, garantindo que a cadeia de suprimentos funcione sem interrupções.

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

## Conclusão

O projeto **CAPO** surge como uma solução inovadora e abrangente para a gestão de produção no setor metalúrgico, especialmente voltado para empresas que atuam na fabricação e montagem de pipelines. Desenvolvido em parceria com a **[COMP (Companhia Metalúrgica Portuguesa)](https://www.metalurgicaportuguesa.pt/)**, o sistema foi concebido para modernizar e otimizar os processos produtivos, alinhando-se às necessidades de inovação e eficiência da empresa.

Com funcionalidades como gestão de produção, controle de materiais, interfaces adaptadas e otimização de processos, o **CAPO** oferece uma ferramenta robusta para acompanhar cada etapa do fluxo produtivo, desde a entrada dos materiais até a saída do produto final. As interfaces flexíveis garantem que o sistema seja intuitivo, eficiente e adaptado às necessidades de cada usuário, sejam eles operadores, administradores ou equipes de logística.
