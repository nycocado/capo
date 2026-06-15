FROM docker.io/library/node:lts-alpine

# Bun como gerenciador de pacotes e runner; Node continua executando o app (nest via shebang)
COPY --from=docker.io/oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun

# Instalar dependências do sistema (libstdc++ é exigida pelo binário do Bun)
RUN apk add --no-cache curl libstdc++

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN bun install

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Comando para desenvolvimento com hot-reload
CMD ["bun", "run", "start:dev"]
