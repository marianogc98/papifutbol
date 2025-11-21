#!/bin/sh
set -e

echo "🚀 Iniciando aplicación PapiFutbol..."

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL no está configurada"
    echo "⚠️  Las migraciones no se ejecutarán"
    echo "✅ Iniciando servidor Next.js sin migraciones..."
    exec node server.js
fi

# Ejecutar migraciones de Prisma antes de iniciar la aplicación
# Prisma CLI está instalado localmente en node_modules
echo "📦 Ejecutando migraciones de base de datos..."
npx --no-update-notifier prisma migrate deploy || {
    echo "❌ ERROR: No se pudieron ejecutar las migraciones"
    echo "⚠️  Continuando sin migraciones (puedes ejecutarlas manualmente después)"
}

# Iniciar la aplicación Next.js
echo "✅ Iniciando servidor Next.js..."
exec node server.js



