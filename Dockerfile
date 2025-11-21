FROM node:18-bullseye-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Verificar que las migraciones existen antes de continuar
RUN ls -la prisma/migrations/ || (echo "ERROR: Migraciones no encontradas en builder" && exit 1)
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
# Copiar prisma completo incluyendo migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh
# Verificar que las migraciones se copiaron correctamente (antes de chown)
RUN ls -la prisma/migrations/ && \
    ls -la prisma/migrations/20251121095031_init/ && \
    test -f prisma/migrations/20251121095031_init/migration.sql || \
    (echo "ERROR: Archivo de migración no encontrado" && exit 1)
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
