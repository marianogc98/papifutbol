-- AlterTable
ALTER TABLE "equipo" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "fecha" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "equipo_slug_key" ON "equipo"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "fecha_slug_key" ON "fecha"("slug");

-- CreateIndex
CREATE INDEX "equipo_slug_idx" ON "equipo"("slug");

-- CreateIndex
CREATE INDEX "fecha_slug_idx" ON "fecha"("slug");

-- Actualizar slugs existentes para equipos
UPDATE "equipo" SET "slug" = LOWER(REGEXP_REPLACE("nombre", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Actualizar slugs existentes para fechas (usar nombre o "fecha-{numero}")
UPDATE "fecha" SET "slug" = CASE 
  WHEN "nombre" IS NOT NULL THEN LOWER(REGEXP_REPLACE("nombre", '[^a-zA-Z0-9]+', '-', 'g'))
  ELSE 'fecha-' || "numero"::TEXT
END
WHERE "slug" IS NULL;

-- Hacer slug NOT NULL después de actualizar
ALTER TABLE "equipo" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "fecha" ALTER COLUMN "slug" SET NOT NULL;

