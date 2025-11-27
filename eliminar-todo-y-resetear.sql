-- ============================================
-- Script para ELIMINAR TODO y resetear la base de datos
-- ⚠️ ADVERTENCIA: Esto elimina TODOS los datos y tablas
-- ============================================
-- Ejecutar en pgAdmin o cualquier cliente PostgreSQL

BEGIN;

-- ============================================
-- 1. ELIMINAR TODAS LAS TABLAS DE LA APLICACIÓN
-- ============================================

-- Eliminar tablas con foreign keys primero (orden correcto)
DROP TABLE IF EXISTS "gol" CASCADE;
DROP TABLE IF EXISTS "partido" CASCADE;
DROP TABLE IF EXISTS "jugador" CASCADE;
DROP TABLE IF EXISTS "fecha" CASCADE;
DROP TABLE IF EXISTS "equipo" CASCADE;
DROP TABLE IF EXISTS "publicidad" CASCADE;
DROP TABLE IF EXISTS "noticia" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Eliminar tablas con nombres en mayúsculas (por si acaso)
DROP TABLE IF EXISTS "Gol" CASCADE;
DROP TABLE IF EXISTS "Partido" CASCADE;
DROP TABLE IF EXISTS "Jugador" CASCADE;
DROP TABLE IF EXISTS "Fecha" CASCADE;
DROP TABLE IF EXISTS "Equipo" CASCADE;
DROP TABLE IF EXISTS "Publicidad" CASCADE;
DROP TABLE IF EXISTS "Noticia" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- 2. ELIMINAR TABLA DE MIGRACIONES DE PRISMA
-- ============================================
-- Esto permite crear una migración nueva desde cero

DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- ============================================
-- 3. ELIMINAR TODAS LAS SECUENCIAS
-- ============================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    ) 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

-- ============================================
-- 4. ELIMINAR TODOS LOS ÍNDICES HUÉRFANOS
-- ============================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        )
    ) 
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
    END LOOP;
END $$;

COMMIT;

-- ============================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- ============================================
-- 
-- 1. Crear nueva migración desde cero:
--    npx prisma migrate dev --name init
--
-- 2. Generar Prisma Client:
--    npx prisma generate
--
-- 3. (Opcional) Cargar datos iniciales:
--    npm run db:seed
--
-- ============================================

