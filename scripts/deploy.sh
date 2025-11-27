#!/bin/bash

# Script de deploy para VPS
# Uso: ./scripts/deploy.sh

set -e

echo "🚀 Iniciando deploy..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml no encontrado"
    exit 1
fi

# Verificar que .env existe
if [ ! -f ".env" ]; then
    echo "❌ Error: archivo .env no encontrado"
    echo "Copia .env.example a .env y configúralo"
    exit 1
fi

# Construir imágenes
echo "📦 Construyendo imágenes Docker..."
docker-compose build

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
docker-compose run --rm app npx prisma migrate deploy

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
docker-compose down
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar salud de los servicios
echo "🏥 Verificando salud de los servicios..."
docker-compose ps

echo "✅ Deploy completado!"
echo "📊 Ver logs con: docker-compose logs -f"

