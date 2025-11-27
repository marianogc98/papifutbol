# Script para resetear completamente la base de datos
# ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos

Write-Host "========================================" -ForegroundColor Red
Write-Host "⚠️  ADVERTENCIA: RESETEO DE BASE DE DATOS" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script va a:" -ForegroundColor Yellow
Write-Host "1. Eliminar TODAS las tablas y datos" -ForegroundColor White
Write-Host "2. Ejecutar todas las migraciones desde cero" -ForegroundColor White
Write-Host "3. Cargar datos iniciales (seed)" -ForegroundColor White
Write-Host ""

$confirmar = Read-Host "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar)"

if ($confirmar -ne "SI") {
    Write-Host ""
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Reseteando base de datos..." -ForegroundColor Cyan
Write-Host ""

# Detener el servidor si está corriendo (opcional)
Write-Host "Nota: Asegúrate de que el servidor de desarrollo esté detenido" -ForegroundColor Yellow
Write-Host ""

# Resetear la base de datos (esto elimina todo y vuelve a crear)
Write-Host "Ejecutando: prisma migrate reset..." -ForegroundColor Yellow
npx prisma migrate reset --force

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al resetear la base de datos" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si el error persiste, puedes hacerlo manualmente:" -ForegroundColor Yellow
    Write-Host "1. Eliminar todas las tablas manualmente en pgAdmin o psql" -ForegroundColor White
    Write-Host "2. Ejecutar: npx prisma migrate deploy" -ForegroundColor White
    Write-Host "3. Ejecutar: npm run db:seed" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ Base de datos reseteada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales por defecto:" -ForegroundColor Cyan
Write-Host "Email: admin@papifutbol.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Puedes verificar la base de datos con:" -ForegroundColor Yellow
Write-Host "npx prisma studio" -ForegroundColor Green
Write-Host ""

