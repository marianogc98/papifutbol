#!/bin/sh

echo "🚀 Iniciando aplicación PapiFutbol..."

# NOTA: Las migraciones se ejecutan manualmente desde Coolify cuando sea necesario
# Para ejecutar migraciones: npx prisma migrate deploy
# Para hacer baseline: npx prisma migrate resolve --applied <migration_name>
# Las tablas fueron creadas manualmente, por lo que no se ejecutan migraciones automáticamente

# Iniciar la aplicación Next.js directamente
echo "✅ Iniciando servidor Next.js..."
exec node server.js
