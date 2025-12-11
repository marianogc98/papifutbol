-- Migración consolidada: Actualiza el schema a la versión final
-- Incluye todos los cambios necesarios para sincronizar la base de datos con el schema actual

-- Agregar campo fechaHora a partido (si no existe)
ALTER TABLE "partido" ADD COLUMN IF NOT EXISTS "fechaHora" TIMESTAMP(3);

-- Crear índice para fechaHora (si no existe)
CREATE INDEX IF NOT EXISTS "partido_fechaHora_idx" ON "partido"("fechaHora");

-- Eliminar campos fechaNac y numero de jugador (si existen)
ALTER TABLE "jugador" DROP COLUMN IF EXISTS "numero";
ALTER TABLE "jugador" DROP COLUMN IF EXISTS "fechaNac";

