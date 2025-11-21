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
# Usar el binario de Prisma directamente desde node_modules
if [ -f "node_modules/.bin/prisma" ]; then
    PRISMA_CMD="node node_modules/.bin/prisma"
elif [ -f "node_modules/prisma/build/index.js" ]; then
    PRISMA_CMD="node node_modules/prisma/build/index.js"
elif [ -d "node_modules/prisma" ]; then
    # Si existe el directorio, intentar ejecutar directamente
    PRISMA_CMD="node node_modules/prisma/build/index.js"
else
    echo "❌ ERROR: Prisma CLI no está disponible"
    echo "⚠️  Continuando sin migraciones..."
    exec node server.js
fi

echo "✅ Usando: $PRISMA_CMD"

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
if $PRISMA_CMD migrate deploy; then
    echo "✅ Migraciones aplicadas correctamente"
else
    echo "❌ ERROR al ejecutar migraciones"
    echo "🔍 Verificando estado de migraciones..."
    $PRISMA_CMD migrate status || true
    echo "⚠️  Continuando sin migraciones (puedes ejecutarlas manualmente después)"
fi

# Iniciar la aplicación Next.js
echo "✅ Iniciando servidor Next.js..."
exec node server.js



