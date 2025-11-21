#!/bin/sh

echo "🚀 Iniciando aplicación PapiFutbol..."

# NOTA: Las migraciones de Prisma deben ejecutarse manualmente desde Coolify
# usando el comando: npx prisma migrate deploy
# Esto es porque Prisma CLI no está disponible en el modo standalone de Next.js
# Ver: https://www.nico.fyi/blog/deploy-next-js-prisma-postgres-using-coolify

# Iniciar la aplicación Next.js directamente
echo "✅ Iniciando servidor Next.js..."
exec node server.js



