-- ============================================
-- Script para renombrar tablas de mayúsculas a minúsculas
-- Ejecutar este script en la base de datos PostgreSQL
-- ============================================

-- IMPORTANTE: Ejecutar este script con permisos de administrador
-- Ejemplo: psql -U postgres -d papifutbol -f renombrar_tablas_mayusculas_a_minusculas.sql

BEGIN;

-- ============================================
-- 1. RENOMBRAR TABLAS
-- ============================================
-- Nota: PostgreSQL actualiza automáticamente las referencias de claves foráneas
-- cuando renombras una tabla, pero debemos renombrar las restricciones e índices manualmente

-- Renombrar tabla User -> user
ALTER TABLE IF EXISTS "User" RENAME TO "user";

-- Renombrar tabla Equipo -> equipo
ALTER TABLE IF EXISTS "Equipo" RENAME TO "equipo";

-- Renombrar tabla Jugador -> jugador
ALTER TABLE IF EXISTS "Jugador" RENAME TO "jugador";

-- Renombrar tabla Fecha -> fecha
ALTER TABLE IF EXISTS "Fecha" RENAME TO "fecha";

-- Renombrar tabla Partido -> partido
ALTER TABLE IF EXISTS "Partido" RENAME TO "partido";

-- Renombrar tabla Gol -> gol
ALTER TABLE IF EXISTS "Gol" RENAME TO "gol";

-- Renombrar tabla Publicidad -> publicidad
ALTER TABLE IF EXISTS "Publicidad" RENAME TO "publicidad";

-- Renombrar tabla Noticia -> noticia
ALTER TABLE IF EXISTS "Noticia" RENAME TO "noticia";

-- ============================================
-- 2. RENOMBRAR RESTRICCIONES (CONSTRAINTS)
-- ============================================

-- Restricciones de PRIMARY KEY
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_pkey') THEN
        ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Equipo_pkey') THEN
        ALTER TABLE "equipo" RENAME CONSTRAINT "Equipo_pkey" TO "equipo_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Jugador_pkey') THEN
        ALTER TABLE "jugador" RENAME CONSTRAINT "Jugador_pkey" TO "jugador_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Fecha_pkey') THEN
        ALTER TABLE "fecha" RENAME CONSTRAINT "Fecha_pkey" TO "fecha_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Partido_pkey') THEN
        ALTER TABLE "partido" RENAME CONSTRAINT "Partido_pkey" TO "partido_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gol_pkey') THEN
        ALTER TABLE "gol" RENAME CONSTRAINT "Gol_pkey" TO "gol_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Publicidad_pkey') THEN
        ALTER TABLE "publicidad" RENAME CONSTRAINT "Publicidad_pkey" TO "publicidad_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Noticia_pkey') THEN
        ALTER TABLE "noticia" RENAME CONSTRAINT "Noticia_pkey" TO "noticia_pkey";
    END IF;
END $$;

-- Restricciones UNIQUE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_email_key') THEN
        ALTER TABLE "user" RENAME CONSTRAINT "User_email_key" TO "user_email_key";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Equipo_nombre_key') THEN
        ALTER TABLE "equipo" RENAME CONSTRAINT "Equipo_nombre_key" TO "equipo_nombre_key";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Fecha_numero_key') THEN
        ALTER TABLE "fecha" RENAME CONSTRAINT "Fecha_numero_key" TO "fecha_numero_key";
    END IF;
END $$;

-- Restricciones de FOREIGN KEY
-- Nota: Los nombres pueden variar, verificar con: SELECT conname FROM pg_constraint WHERE contype = 'f'
DO $$
BEGIN
    -- Renombrar foreign keys de jugador
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Jugador_equipoId_fkey') THEN
        ALTER TABLE "jugador" RENAME CONSTRAINT "Jugador_equipoId_fkey" TO "jugador_equipoId_fkey";
    END IF;
    
    -- Renombrar foreign keys de partido
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Partido_fechaId_fkey') THEN
        ALTER TABLE "partido" RENAME CONSTRAINT "Partido_fechaId_fkey" TO "partido_fechaId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Partido_equipoLocalId_fkey') THEN
        ALTER TABLE "partido" RENAME CONSTRAINT "Partido_equipoLocalId_fkey" TO "partido_equipoLocalId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Partido_equipoVisitanteId_fkey') THEN
        ALTER TABLE "partido" RENAME CONSTRAINT "Partido_equipoVisitanteId_fkey" TO "partido_equipoVisitanteId_fkey";
    END IF;
    
    -- Renombrar foreign keys de gol
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gol_partidoId_fkey') THEN
        ALTER TABLE "gol" RENAME CONSTRAINT "Gol_partidoId_fkey" TO "gol_partidoId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gol_jugadorId_fkey') THEN
        ALTER TABLE "gol" RENAME CONSTRAINT "Gol_jugadorId_fkey" TO "gol_jugadorId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gol_equipoId_fkey') THEN
        ALTER TABLE "gol" RENAME CONSTRAINT "Gol_equipoId_fkey" TO "gol_equipoId_fkey";
    END IF;
END $$;

-- ============================================
-- 3. RENOMBRAR ÍNDICES
-- ============================================

DO $$
BEGIN
    -- Índices UNIQUE
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_email_key') THEN
        ALTER INDEX "User_email_key" RENAME TO "user_email_key";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Equipo_nombre_key') THEN
        ALTER INDEX "Equipo_nombre_key" RENAME TO "equipo_nombre_key";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Fecha_numero_key') THEN
        ALTER INDEX "Fecha_numero_key" RENAME TO "fecha_numero_key";
    END IF;
    
    -- Índices regulares
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Equipo_estado_idx') THEN
        ALTER INDEX "Equipo_estado_idx" RENAME TO "equipo_estado_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Equipo_vidas_idx') THEN
        ALTER INDEX "Equipo_vidas_idx" RENAME TO "equipo_vidas_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Jugador_equipoId_idx') THEN
        ALTER INDEX "Jugador_equipoId_idx" RENAME TO "jugador_equipoId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Jugador_estado_idx') THEN
        ALTER INDEX "Jugador_estado_idx" RENAME TO "jugador_estado_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Fecha_numero_idx') THEN
        ALTER INDEX "Fecha_numero_idx" RENAME TO "fecha_numero_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Partido_fechaId_idx') THEN
        ALTER INDEX "Partido_fechaId_idx" RENAME TO "partido_fechaId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Partido_estado_idx') THEN
        ALTER INDEX "Partido_estado_idx" RENAME TO "partido_estado_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Partido_equipoLocalId_idx') THEN
        ALTER INDEX "Partido_equipoLocalId_idx" RENAME TO "partido_equipoLocalId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Partido_equipoVisitanteId_idx') THEN
        ALTER INDEX "Partido_equipoVisitanteId_idx" RENAME TO "partido_equipoVisitanteId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Gol_partidoId_idx') THEN
        ALTER INDEX "Gol_partidoId_idx" RENAME TO "gol_partidoId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Gol_jugadorId_idx') THEN
        ALTER INDEX "Gol_jugadorId_idx" RENAME TO "gol_jugadorId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Gol_equipoId_idx') THEN
        ALTER INDEX "Gol_equipoId_idx" RENAME TO "gol_equipoId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Publicidad_activa_idx') THEN
        ALTER INDEX "Publicidad_activa_idx" RENAME TO "publicidad_activa_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Publicidad_orden_idx') THEN
        ALTER INDEX "Publicidad_orden_idx" RENAME TO "publicidad_orden_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Noticia_tipo_idx') THEN
        ALTER INDEX "Noticia_tipo_idx" RENAME TO "noticia_tipo_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Noticia_orden_idx') THEN
        ALTER INDEX "Noticia_orden_idx" RENAME TO "noticia_orden_idx";
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estas consultas para verificar que todo se renombró correctamente:

-- Ver todas las tablas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Ver todas las restricciones
-- SELECT conname, conrelid::regclass FROM pg_constraint WHERE contype IN ('p', 'f', 'u') ORDER BY conname;

-- Ver todos los índices
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

