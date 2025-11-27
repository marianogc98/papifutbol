-- ============================================
-- Script para agregar columnas slug e índices
-- Ejecutar este script en la base de datos PostgreSQL local
-- ============================================

BEGIN;

-- ============================================
-- 1. AGREGAR COLUMNAS SLUG (si no existen)
-- ============================================

-- Agregar columna slug a equipo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipo' AND column_name = 'slug'
    ) THEN
        ALTER TABLE "equipo" ADD COLUMN "slug" TEXT;
    END IF;
END $$;

-- Agregar columna slug a fecha si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fecha' AND column_name = 'slug'
    ) THEN
        ALTER TABLE "fecha" ADD COLUMN "slug" TEXT;
    END IF;
END $$;

-- ============================================
-- 2. ACTUALIZAR SLUGS EXISTENTES (si están NULL)
-- ============================================

-- Actualizar slugs existentes para equipos
UPDATE "equipo" 
SET "slug" = LOWER(REGEXP_REPLACE("nombre", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Actualizar slugs existentes para fechas (usar nombre o "fecha-{numero}")
UPDATE "fecha" 
SET "slug" = CASE 
    WHEN "nombre" IS NOT NULL THEN LOWER(REGEXP_REPLACE("nombre", '[^a-zA-Z0-9]+', '-', 'g'))
    ELSE 'fecha-' || "numero"::TEXT
END
WHERE "slug" IS NULL;

-- ============================================
-- 2.1. CORREGIR SLUGS DUPLICADOS
-- ============================================

-- Corregir slugs duplicados en equipo: agregar sufijo con ID si hay duplicados
DO $$
DECLARE
    rec RECORD;
    counter INTEGER;
BEGIN
    FOR rec IN 
        SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") as rn
        FROM "equipo"
        WHERE "slug" IN (
            SELECT "slug" FROM "equipo" 
            GROUP BY "slug" 
            HAVING COUNT(*) > 1
        )
    LOOP
        IF rec.rn > 1 THEN
            -- Agregar sufijo con ID para hacer único el slug
            UPDATE "equipo" 
            SET "slug" = rec."slug" || '-' || SUBSTRING(rec."id" FROM 1 FOR 8)
            WHERE "id" = rec."id";
        END IF;
    END LOOP;
END $$;

-- Corregir slugs duplicados en fecha: usar "fecha-{numero}" para hacerlos únicos
DO $$
DECLARE
    rec RECORD;
    counter INTEGER;
BEGIN
    -- Primero, para todos los duplicados, usar formato "fecha-{numero}-{sufijo}" si es necesario
    FOR rec IN 
        SELECT 
            "id", 
            "slug", 
            "numero",
            ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "numero", "id") as rn,
            COUNT(*) OVER (PARTITION BY "slug") as total_duplicados
        FROM "fecha"
        WHERE "slug" IN (
            SELECT "slug" FROM "fecha" 
            GROUP BY "slug" 
            HAVING COUNT(*) > 1
        )
    LOOP
        IF rec.total_duplicados > 1 THEN
            IF rec.rn = 1 THEN
                -- El primero mantiene el slug original si es único, sino usar formato con número
                UPDATE "fecha" 
                SET "slug" = 'fecha-' || rec."numero"::TEXT
                WHERE "id" = rec."id";
            ELSE
                -- Los demás agregan un sufijo con parte del ID para hacerlos únicos
                UPDATE "fecha" 
                SET "slug" = 'fecha-' || rec."numero"::TEXT || '-' || SUBSTRING(rec."id" FROM 1 FOR 8)
                WHERE "id" = rec."id";
            END IF;
        END IF;
    END LOOP;
    
    -- Verificar si aún hay duplicados después de la corrección anterior
    -- Si los hay, usar formato más específico
    FOR rec IN 
        SELECT 
            "id", 
            "slug", 
            "numero",
            ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") as rn
        FROM "fecha"
        WHERE "slug" IN (
            SELECT "slug" FROM "fecha" 
            GROUP BY "slug" 
            HAVING COUNT(*) > 1
        )
    LOOP
        IF rec.rn > 1 THEN
            UPDATE "fecha" 
            SET "slug" = rec."slug" || '-' || SUBSTRING(rec."id" FROM 1 FOR 8)
            WHERE "id" = rec."id";
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 3. CREAR ÍNDICES UNIQUE (si no existen)
-- ============================================

-- Crear índice UNIQUE para equipo.slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'equipo_slug_key'
    ) THEN
        CREATE UNIQUE INDEX "equipo_slug_key" ON "equipo"("slug");
    END IF;
END $$;

-- Crear índice UNIQUE para fecha.slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'fecha_slug_key'
    ) THEN
        CREATE UNIQUE INDEX "fecha_slug_key" ON "fecha"("slug");
    END IF;
END $$;

-- ============================================
-- 4. CREAR ÍNDICES REGULARES (si no existen)
-- ============================================

-- Crear índice regular para equipo.slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'equipo_slug_idx'
    ) THEN
        CREATE INDEX "equipo_slug_idx" ON "equipo"("slug");
    END IF;
END $$;

-- Crear índice regular para fecha.slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'fecha_slug_idx'
    ) THEN
        CREATE INDEX "fecha_slug_idx" ON "fecha"("slug");
    END IF;
END $$;

-- ============================================
-- 5. HACER SLUG NOT NULL (después de actualizar valores)
-- ============================================

-- Hacer slug NOT NULL en equipo
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipo' 
        AND column_name = 'slug' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "equipo" ALTER COLUMN "slug" SET NOT NULL;
    END IF;
END $$;

-- Hacer slug NOT NULL en fecha
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fecha' 
        AND column_name = 'slug' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "fecha" ALTER COLUMN "slug" SET NOT NULL;
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estas consultas para verificar que todo se creó correctamente:

-- Ver columnas slug
-- SELECT table_name, column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('equipo', 'fecha') AND column_name = 'slug';

-- Ver índices creados
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname IN ('equipo_slug_key', 'equipo_slug_idx', 'fecha_slug_key', 'fecha_slug_idx')
-- ORDER BY tablename, indexname;

