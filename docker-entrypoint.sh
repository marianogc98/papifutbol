#!/bin/sh
set -e

echo "🚀 Iniciando aplicación PapiFutbol..."

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ ADVERTENCIA: DATABASE_URL no está configurada"
    echo "⚠️ Saltando migraciones"
    echo "🟢 Iniciando servidor Next.js..."
    exec node server.js
fi

# Generar Prisma Client si falta
if [ ! -d "node_modules/.prisma" ]; then
  echo "🔧 Prisma Client no encontrado, generando..."
  npx prisma generate --no-engine
fi

# Ejecutar migraciones con retry
echo "📦 Ejecutando migraciones de Prisma..."

retry=10
until npx --no-update-notifier prisma migrate deploy || [ $retry -le 0 ]; do
  retry=$((retry-1))
  echo "⏳ Base de datos no disponible aún. Reintentando en 3s... Intentos restantes: $retry"
  sleep 3
done

if [ $retry -le 0 ]; then
  echo "❌ No se pudieron aplicar migraciones."
else
  echo "✅ Migraciones aplicadas correctamente."
fi

# Iniciar servidor
echo "🚀 Iniciando servidor Next.js..."
exec node server.js
