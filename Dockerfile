# Dependencies
FROM node:17-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build
FROM node:17-alpine AS builder
WORKDIR /app
RUN apk add --no-cache rsync
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SENTRY_TOKEN
RUN wget -O /app/monaco.tgz https://registry.npmjs.org/monaco-editor/-/monaco-editor-0.33.0.tgz && \
    tar xf /app/monaco.tgz -C /app/public/vs && \
    rsync -a /app/public/vs/package/min/vs/* /app/public/vs && \
    rm -rf /app/monaco.tar.gz /app/public/vs/package/

RUN npm install -g pnpm
RUN SENTRY_AUTH_TOKEN=$SENTRY_TOKEN pnpm build

# Run
FROM node:17-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.source=https://github.com/timas130/campfire-web

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
