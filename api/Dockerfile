# Build com Bun; runtime em Node sobre o dist do NestJS.
FROM docker.io/library/node:lts-alpine AS deps
COPY --from=docker.io/oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
# libstdc++ p/ o binário do Bun; toolchain p/ compilar addons nativos (bcrypt).
RUN apk add --no-cache libstdc++ python3 make g++
WORKDIR /app
COPY package.json ./
RUN bun install --production

FROM docker.io/library/node:lts-alpine AS builder
COPY --from=docker.io/oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
RUN apk add --no-cache libstdc++ python3 make g++
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM docker.io/library/node:lts-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
# Documentos-semente (rev/wps); o volume de storage é populado a partir daqui.
COPY --from=builder --chown=nestjs:nodejs /app/storage ./storage
USER nestjs
EXPOSE 3002
CMD ["node", "dist/main"]
