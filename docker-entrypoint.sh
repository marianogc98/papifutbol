#!/bin/sh
set -e

echo "🚀 Iniciando aplicación PapiFutbol..."

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

# Verificar que Prisma esté disponible
echo "🔍 Verificando Prisma..."
if ! command -v npx > /dev/null 2>&1; then
    echo "❌ ERROR: npx no está disponible"
    exit 1
fi

# Verificar que las migraciones existan
if [ ! -d "prisma/migrations" ]; then
    echo "❌ ERROR: Directorio prisma/migrations no encontrado"
    exit 1
fi

echo "📦 Ejecutando migraciones de base de datos..."
echo "📋 Migraciones encontradas:"
ls -la prisma/migrations/ || true

# Ejecutar migraciones con salida detallada
if npx prisma migrate deploy; then
    echo "✅ Migraciones aplicadas correctamente"
else
    echo "❌ ERROR al ejecutar migraciones"
    echo "🔍 Verificando estado de migraciones..."
    npx prisma migrate status || true
    echo "❌ No se pueden continuar sin las migraciones"
    exit 1
fi

# Iniciar la aplicación Next.js
echo "✅ Iniciando servidor Next.js..."
exec node server.js



