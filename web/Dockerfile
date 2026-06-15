# Build com Bun; runtime em Node sobre a saída standalone do NextJS.
FROM docker.io/library/node:lts-alpine AS builder
COPY --from=docker.io/oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
# libstdc++ é exigida pelo binário musl do Bun.
RUN apk add --no-cache libstdc++
WORKDIR /app

# NEXT_PUBLIC_* são embutidos no bundle durante o build, então chegam como ARG.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM docker.io/library/node:lts-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
