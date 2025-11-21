#!/bin/sh

echo "🚀 Iniciando aplicación PapiFutbol..."

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    echo "⚠️  Continuando sin migraciones..."
    exec node server.js
fi

# Verificar que Prisma esté disponible
echo "🔍 Verificando Prisma..."
if ! command -v prisma > /dev/null 2>&1; then
    echo "❌ ERROR: Prisma CLI no está disponible"
    echo "⚠️  Continuando sin migraciones..."
    exec node server.js
fi

# Verificar que las migraciones existan
if [ ! -d "prisma/migrations" ]; then
    echo "❌ ERROR: Directorio prisma/migrations no encontrado"
    echo "⚠️  Continuando sin migraciones..."
    exec node server.js
fi

echo "📦 Ejecutando migraciones de base de datos..."
echo "📋 Migraciones encontradas:"
ls -la prisma/migrations/ || true

# Ejecutar migraciones con salida detallada (sin set -e para no salir si falla)
if prisma migrate deploy; then
    echo "✅ Migraciones aplicadas correctamente"
else
    echo "❌ ERROR al ejecutar migraciones"
    echo "🔍 Verificando estado de migraciones..."
    prisma migrate status || true
    echo "⚠️  Continuando sin migraciones (puedes ejecutarlas manualmente después)"
fi

# Iniciar la aplicación Next.js
echo "✅ Iniciando servidor Next.js..."
exec node server.js



