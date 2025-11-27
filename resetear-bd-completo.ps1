# Script completo para resetear la base de datos
# Elimina todo y vuelve a crear desde cero

Write-Host "========================================" -ForegroundColor Red
Write-Host "⚠️  RESETEO COMPLETO DE BASE DE DATOS" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Paso 1: Eliminar todas las tablas usando SQL
Write-Host "Paso 1: Eliminando todas las tablas..." -ForegroundColor Yellow

$sqlDrop = @"
-- Eliminar todas las tablas
DROP TABLE IF EXISTS "gol" CASCADE;
DROP TABLE IF EXISTS "partido" CASCADE;
DROP TABLE IF EXISTS "jugador" CASCADE;
DROP TABLE IF EXISTS "fecha" CASCADE;
DROP TABLE IF EXISTS "equipo" CASCADE;
DROP TABLE IF EXISTS "publicidad" CASCADE;
DROP TABLE IF EXISTS "noticia" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "Gol" CASCADE;
DROP TABLE IF EXISTS "Partido" CASCADE;
DROP TABLE IF EXISTS "Jugador" CASCADE;
DROP TABLE IF EXISTS "Fecha" CASCADE;
DROP TABLE IF EXISTS "Equipo" CASCADE;
DROP TABLE IF EXISTS "Publicidad" CASCADE;
DROP TABLE IF EXISTS "Noticia" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
"@

# Guardar SQL temporal
$sqlDrop | Out-File -FilePath "temp-drop-tables.sql" -Encoding UTF8

# Ejecutar SQL (necesitas tener psql en PATH o ajustar la ruta)
Write-Host "Ejecutando SQL para eliminar tablas..." -ForegroundColor Cyan
Write-Host "Si tienes psql configurado, ejecuta:" -ForegroundColor Yellow
Write-Host 'psql -U postgres -d papifutbol -f temp-drop-tables.sql' -ForegroundColor Green
Write-Host ""
Write-Host "O ejecuta manualmente en pgAdmin/psql el contenido de temp-drop-tables.sql" -ForegroundColor Yellow
Write-Host ""

$continuar = Read-Host "¿Ya eliminaste las tablas? (s/n)"

if ($continuar -ne "s" -and $continuar -ne "S") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    Remove-Item "temp-drop-tables.sql" -ErrorAction SilentlyContinue
    exit 0
}

# Paso 2: Eliminar migraciones antiguas y crear nuevas
Write-Host ""
Write-Host "Paso 2: Creando nueva migración desde cero..." -ForegroundColor Yellow

# Eliminar carpeta de migraciones (opcional, mejor hacer backup)
Write-Host "⚠️  Se recomienda hacer backup de prisma/migrations antes de continuar" -ForegroundColor Red
$eliminarMigraciones = Read-Host "¿Eliminar migraciones antiguas y crear nuevas? (s/n)"

if ($eliminarMigraciones -eq "s" -or $eliminarMigraciones -eq "S") {
    # Hacer backup
    if (Test-Path "prisma/migrations") {
        $backupName = "prisma/migrations_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item -Path "prisma/migrations" -Destination $backupName -Recurse
        Write-Host "✓ Backup creado en: $backupName" -ForegroundColor Green
    }
    
    # Eliminar migraciones
    Remove-Item -Path "prisma/migrations" -Recurse -Force
    Write-Host "✓ Migraciones antiguas eliminadas" -ForegroundColor Green
}

# Paso 3: Crear nueva migración inicial
Write-Host ""
Write-Host "Paso 3: Creando migración inicial..." -ForegroundColor Yellow
npx prisma migrate dev --name init --create-only

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear migración" -ForegroundColor Red
    exit 1
}

# Paso 4: Aplicar migración
Write-Host ""
Write-Host "Paso 4: Aplicando migración..." -ForegroundColor Yellow
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al aplicar migración" -ForegroundColor Red
    exit 1
}

# Paso 5: Generar Prisma Client
Write-Host ""
Write-Host "Paso 5: Generando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al generar Prisma Client" -ForegroundColor Red
    exit 1
}

# Paso 6: Cargar datos iniciales
Write-Host ""
Write-Host "Paso 6: ¿Cargar datos iniciales (seed)?" -ForegroundColor Yellow
$cargarSeed = Read-Host "¿Cargar datos de ejemplo? (s/n)"

if ($cargarSeed -eq "s" -or $cargarSeed -eq "S") {
    npm run db:seed
}

# Limpiar archivo temporal
Remove-Item "temp-drop-tables.sql" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Base de datos reseteada exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales por defecto:" -ForegroundColor Cyan
Write-Host "Email: admin@papifutbol.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""

