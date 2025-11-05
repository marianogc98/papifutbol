# Scripts de Deploy y Mantenimiento

## deploy.sh

Script para hacer deploy completo en el VPS.

**Uso:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Qué hace:**
1. Construye las imágenes Docker
2. Ejecuta migraciones de base de datos
3. Reinicia los servicios

## backup.sh

Script para hacer backup de la base de datos.

**Uso:**
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

**Qué hace:**
1. Crea backup de PostgreSQL
2. Comprime el backup
3. Elimina backups antiguos (más de 7 días)

**Configurar backup automático:**
```bash
# Agregar al crontab (backup diario a las 3 AM)
crontab -e
# Agregar:
0 3 * * * cd /opt/papifutbol && ./scripts/backup.sh
```

