# Script para configurar la base de datos del proyecto PapiFutbol
# Este script ayuda a crear la base de datos y ejecutar las migraciones

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración de Base de Datos PapiFutbol" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe el archivo .env
if (-not (Test-Path .env)) {
    Write-Host "ERROR: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Por favor, crea un archivo .env con la siguiente configuración:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host 'DATABASE_URL="postgresql://usuario:password@localhost:5432/papifutbol?schema=public"' -ForegroundColor Green
    exit 1
}

Write-Host "✓ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Solicitar información de conexión
Write-Host "Para crear la base de datos, necesitas:" -ForegroundColor Yellow
Write-Host "1. Conectarte a PostgreSQL (usuario postgres o tu usuario)" -ForegroundColor White
Write-Host "2. Ejecutar: CREATE DATABASE papifutbol;" -ForegroundColor Green
Write-Host ""

$crearBD = Read-Host "¿Ya creaste la base de datos 'papifutbol'? (s/n)"

if ($crearBD -ne "s" -and $crearBD -ne "S") {
    Write-Host ""
    Write-Host "Por favor, crea la base de datos primero:" -ForegroundColor Yellow
    Write-Host "1. Abre psql o pgAdmin" -ForegroundColor White
    Write-Host "2. Conéctate a PostgreSQL" -ForegroundColor White
    Write-Host "3. Ejecuta: CREATE DATABASE papifutbol;" -ForegroundColor Green
    Write-Host ""
    Write-Host "O ejecuta este comando en PowerShell (si tienes psql en PATH):" -ForegroundColor Yellow
    Write-Host 'psql -U postgres -c "CREATE DATABASE papifutbol;"' -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Generando Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al generar Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma Client generado" -ForegroundColor Green
Write-Host ""

Write-Host "Ejecutando migraciones..." -ForegroundColor Yellow
npm run prisma:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al ejecutar migraciones" -ForegroundColor Red
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "1. La base de datos 'papifutbol' existe" -ForegroundColor White
    Write-Host "2. El archivo .env tiene la DATABASE_URL correcta" -ForegroundColor White
    Write-Host "3. PostgreSQL está corriendo" -ForegroundColor White
    exit 1
}

Write-Host "✓ Migraciones ejecutadas correctamente" -ForegroundColor Green
Write-Host ""

$ejecutarSeed = Read-Host "¿Deseas cargar datos iniciales (seed)? (s/n)"

if ($ejecutarSeed -eq "s" -or $ejecutarSeed -eq "S") {
    Write-Host ""
    Write-Host "Cargando datos iniciales..." -ForegroundColor Yellow
    npm run prisma:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Datos iniciales cargados" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credenciales por defecto:" -ForegroundColor Yellow
        Write-Host "Email: admin@torneo.com" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "¡Configuración completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Puedes verificar la base de datos con:" -ForegroundColor Yellow
Write-Host "npm run prisma:studio" -ForegroundColor Green



