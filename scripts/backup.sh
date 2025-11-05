#!/bin/bash

# Script de backup de base de datos
# Uso: ./scripts/backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/papifutbol_backup_$DATE.sql"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "📦 Creando backup de la base de datos..."

# Backup de PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres papifutbol > $BACKUP_FILE

# Comprimir backup
echo "🗜️  Comprimiendo backup..."
gzip $BACKUP_FILE

echo "✅ Backup creado: ${BACKUP_FILE}.gz"

# Eliminar backups antiguos (mantener últimos 7 días)
echo "🧹 Limpiando backups antiguos..."
find $BACKUP_DIR -name "papifutbol_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Limpieza completada"

