# Dockerfile para producción en VPS
FROM node:18-alpine AS base

# Instalar dependencias solo cuando se necesiten
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
# Instalar todas las dependencias incluyendo devDependencies (necesarias para el build)
# Deshabilitar scripts postinstall porque prisma/ aún no está copiado
RUN npm ci --ignore-scripts

# Rebuild del código fuente solo cuando se necesite
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código (asegurando que prisma/ esté incluido)
COPY . .

# Verificar que prisma/schema.prisma existe antes de generar
RUN ls -la prisma/ || (echo "ERROR: prisma directory not found!" && exit 1)
RUN test -f prisma/schema.prisma || (echo "ERROR: prisma/schema.prisma not found!" && exit 1)

# Generar Prisma Client (no necesita DATABASE_URL para esto)
RUN npx prisma generate

# Build de la aplicación
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION=true
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

