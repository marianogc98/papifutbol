-- ============================================
-- Script SQL para resetear completamente la base de datos
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos
-- ============================================
-- Ejecutar: psql -U postgres -d papifutbol -f resetear-bd-sql.sql

BEGIN;

-- ============================================
-- ELIMINAR TODAS LAS TABLAS (en orden correcto por dependencias)
-- ============================================

-- Eliminar tablas con foreign keys primero
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

-- Eliminar todas las secuencias (si existen)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

COMMIT;

-- ============================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- ============================================
-- 1. Ejecutar migraciones de Prisma:
--    npx prisma migrate deploy
--
-- 2. (Opcional) Cargar datos iniciales:
--    npm run db:seed
--
-- ============================================

