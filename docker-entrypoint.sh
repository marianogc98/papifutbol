#!/bin/sh
set -e

echo "🚀 Iniciando aplicación PapiFutbol..."

# Ejecutar migraciones de Prisma
echo "📦 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy || {
    echo "⚠️  Advertencia: Error al ejecutar migraciones. Continuando..."
}

# Iniciar la aplicación Next.js
echo "✅ Iniciando servidor Next.js..."
exec node server.js

