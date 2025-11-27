-- ============================================
-- Script para corregir slugs duplicados antes de crear índices UNIQUE
-- Ejecutar este script ANTES de ejecutar agregar_slug_indices.sql
-- ============================================

BEGIN;

-- ============================================
-- CORREGIR SLUGS DUPLICADOS EN FECHA
-- ============================================

-- Mostrar duplicados actuales (solo para información)
-- SELECT "slug", COUNT(*) as cantidad 
-- FROM "fecha" 
-- GROUP BY "slug" 
-- HAVING COUNT(*) > 1;

-- Corregir duplicados: usar formato "fecha-{numero}-{sufijo}" para hacerlos únicos
DO $$
DECLARE
    rec RECORD;
    new_slug TEXT;
BEGIN
    -- Para cada grupo de slugs duplicados
    FOR rec IN 
        SELECT 
            "id", 
            "slug", 
            "numero",
            ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "numero", "id") as rn
        FROM "fecha"
        WHERE "slug" IN (
            SELECT "slug" FROM "fecha" 
            GROUP BY "slug" 
            HAVING COUNT(*) > 1
        )
        ORDER BY "slug", "numero", "id"
    LOOP
        IF rec.rn = 1 THEN
            -- El primer registro mantiene el slug si es único, sino usar "fecha-{numero}"
            new_slug := 'fecha-' || rec."numero"::TEXT;
            
            -- Verificar si este nuevo slug ya existe
            WHILE EXISTS (SELECT 1 FROM "fecha" WHERE "slug" = new_slug AND "id" != rec."id") LOOP
                new_slug := 'fecha-' || rec."numero"::TEXT || '-' || SUBSTRING(rec."id" FROM 1 FOR 8);
            END LOOP;
            
            UPDATE "fecha" 
            SET "slug" = new_slug
            WHERE "id" = rec."id";
        ELSE
            -- Los demás registros usan formato con sufijo único
            new_slug := 'fecha-' || rec."numero"::TEXT || '-' || SUBSTRING(rec."id" FROM 1 FOR 8);
            
            -- Asegurar que sea único
            WHILE EXISTS (SELECT 1 FROM "fecha" WHERE "slug" = new_slug AND "id" != rec."id") LOOP
                new_slug := 'fecha-' || rec."numero"::TEXT || '-' || SUBSTRING(rec."id" FROM 1 FOR 12);
            END LOOP;
            
            UPDATE "fecha" 
            SET "slug" = new_slug
            WHERE "id" = rec."id";
        END IF;
    END LOOP;
END $$;

-- ============================================
-- CORREGIR SLUGS DUPLICADOS EN EQUIPO
-- ============================================

-- Corregir duplicados en equipo: agregar sufijo con ID si hay duplicados
DO $$
DECLARE
    rec RECORD;
    new_slug TEXT;
BEGIN
    FOR rec IN 
        SELECT 
            "id", 
            "slug",
            "nombre",
            ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") as rn
        FROM "equipo"
        WHERE "slug" IN (
            SELECT "slug" FROM "equipo" 
            GROUP BY "slug" 
            HAVING COUNT(*) > 1
        )
        ORDER BY "slug", "id"
    LOOP
        IF rec.rn > 1 THEN
            -- Agregar sufijo con ID para hacer único el slug
            new_slug := rec."slug" || '-' || SUBSTRING(rec."id" FROM 1 FOR 8);
            
            -- Asegurar que sea único
            WHILE EXISTS (SELECT 1 FROM "equipo" WHERE "slug" = new_slug AND "id" != rec."id") LOOP
                new_slug := rec."slug" || '-' || SUBSTRING(rec."id" FROM 1 FOR 12);
            END LOOP;
            
            UPDATE "equipo" 
            SET "slug" = new_slug
            WHERE "id" = rec."id";
        END IF;
    END LOOP;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estas consultas para verificar que no hay duplicados:

-- Verificar duplicados en fecha
-- SELECT "slug", COUNT(*) as cantidad 
-- FROM "fecha" 
-- GROUP BY "slug" 
-- HAVING COUNT(*) > 1;

-- Verificar duplicados en equipo
-- SELECT "slug", COUNT(*) as cantidad 
-- FROM "equipo" 
-- GROUP BY "slug" 
-- HAVING COUNT(*) > 1;

