-- ============================================
-- Script para crear la base de datos completa de PapiFutbol
-- Incluye: tablas, índices, foreign keys y restricciones
-- Todas las tablas usan nombres en minúscula
-- ============================================
-- Ejecutar: psql -U postgres -d papifutbol -f crear_bd.sql
-- O crear la base de datos primero: CREATE DATABASE papifutbol;

BEGIN;

-- ============================================
-- 1. CREAR TABLAS
-- ============================================

-- Tabla: user (Administradores)
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- Tabla: equipo
CREATE TABLE IF NOT EXISTS "equipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "escudo" TEXT,
    "vidas" INTEGER NOT NULL DEFAULT 2,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "equipo_pkey" PRIMARY KEY ("id")
);

-- Tabla: jugador
CREATE TABLE IF NOT EXISTS "jugador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "numero" INTEGER,
    "fechaNac" TIMESTAMP(3),
    "foto" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "equipoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "jugador_pkey" PRIMARY KEY ("id")
);

-- Tabla: fecha
CREATE TABLE IF NOT EXISTS "fecha" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT,
    "slug" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fecha_pkey" PRIMARY KEY ("id")
);

-- Tabla: partido
CREATE TABLE IF NOT EXISTS "partido" (
    "id" TEXT NOT NULL,
    "fechaId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3),
    "equipoLocalId" TEXT NOT NULL,
    "equipoVisitanteId" TEXT NOT NULL,
    "golesLocal" INTEGER NOT NULL DEFAULT 0,
    "golesVisitante" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "partido_pkey" PRIMARY KEY ("id")
);

-- Tabla: gol
CREATE TABLE IF NOT EXISTS "gol" (
    "id" TEXT NOT NULL,
    "partidoId" TEXT NOT NULL,
    "jugadorId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "esPenal" BOOLEAN NOT NULL DEFAULT false,
    "esAutogol" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gol_pkey" PRIMARY KEY ("id")
);

-- Tabla: publicidad
CREATE TABLE IF NOT EXISTS "publicidad" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "imagen" TEXT,
    "url" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "posicion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "publicidad_pkey" PRIMARY KEY ("id")
);

-- Tabla: noticia
CREATE TABLE IF NOT EXISTS "noticia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'informacion',
    "url" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "noticia_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 2. CREAR ÍNDICES UNIQUE
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "equipo_nombre_key" ON "equipo"("nombre");
CREATE UNIQUE INDEX IF NOT EXISTS "equipo_slug_key" ON "equipo"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "fecha_numero_key" ON "fecha"("numero");
CREATE UNIQUE INDEX IF NOT EXISTS "fecha_slug_key" ON "fecha"("slug");

-- ============================================
-- 3. CREAR ÍNDICES REGULARES
-- ============================================

-- Índices para equipo
CREATE INDEX IF NOT EXISTS "equipo_estado_idx" ON "equipo"("estado");
CREATE INDEX IF NOT EXISTS "equipo_vidas_idx" ON "equipo"("vidas");
CREATE INDEX IF NOT EXISTS "equipo_slug_idx" ON "equipo"("slug");

-- Índices para jugador
CREATE INDEX IF NOT EXISTS "jugador_equipoId_idx" ON "jugador"("equipoId");
CREATE INDEX IF NOT EXISTS "jugador_estado_idx" ON "jugador"("estado");

-- Índices para fecha
CREATE INDEX IF NOT EXISTS "fecha_numero_idx" ON "fecha"("numero");
CREATE INDEX IF NOT EXISTS "fecha_slug_idx" ON "fecha"("slug");

-- Índices para partido
CREATE INDEX IF NOT EXISTS "partido_fechaId_idx" ON "partido"("fechaId");
CREATE INDEX IF NOT EXISTS "partido_estado_idx" ON "partido"("estado");
CREATE INDEX IF NOT EXISTS "partido_equipoLocalId_idx" ON "partido"("equipoLocalId");
CREATE INDEX IF NOT EXISTS "partido_equipoVisitanteId_idx" ON "partido"("equipoVisitanteId");
CREATE INDEX IF NOT EXISTS "partido_fechaHora_idx" ON "partido"("fechaHora");

-- Índices para gol
CREATE INDEX IF NOT EXISTS "gol_partidoId_idx" ON "gol"("partidoId");
CREATE INDEX IF NOT EXISTS "gol_jugadorId_idx" ON "gol"("jugadorId");
CREATE INDEX IF NOT EXISTS "gol_equipoId_idx" ON "gol"("equipoId");

-- Índices para publicidad
CREATE INDEX IF NOT EXISTS "publicidad_activa_idx" ON "publicidad"("activa");
CREATE INDEX IF NOT EXISTS "publicidad_orden_idx" ON "publicidad"("orden");

-- Índices para noticia
CREATE INDEX IF NOT EXISTS "noticia_tipo_idx" ON "noticia"("tipo");
CREATE INDEX IF NOT EXISTS "noticia_orden_idx" ON "noticia"("orden");

-- ============================================
-- 4. CREAR FOREIGN KEYS
-- ============================================

-- Foreign keys para jugador
ALTER TABLE "jugador" 
    ADD CONSTRAINT "jugador_equipoId_fkey" 
    FOREIGN KEY ("equipoId") 
    REFERENCES "equipo"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Foreign keys para partido
ALTER TABLE "partido" 
    ADD CONSTRAINT "partido_fechaId_fkey" 
    FOREIGN KEY ("fechaId") 
    REFERENCES "fecha"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE "partido" 
    ADD CONSTRAINT "partido_equipoLocalId_fkey" 
    FOREIGN KEY ("equipoLocalId") 
    REFERENCES "equipo"("id") 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

ALTER TABLE "partido" 
    ADD CONSTRAINT "partido_equipoVisitanteId_fkey" 
    FOREIGN KEY ("equipoVisitanteId") 
    REFERENCES "equipo"("id") 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

-- Foreign keys para gol
ALTER TABLE "gol" 
    ADD CONSTRAINT "gol_partidoId_fkey" 
    FOREIGN KEY ("partidoId") 
    REFERENCES "partido"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE "gol" 
    ADD CONSTRAINT "gol_jugadorId_fkey" 
    FOREIGN KEY ("jugadorId") 
    REFERENCES "jugador"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE "gol" 
    ADD CONSTRAINT "gol_equipoId_fkey" 
    FOREIGN KEY ("equipoId") 
    REFERENCES "equipo"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estas consultas para verificar que todo se creó correctamente:

-- Ver todas las tablas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Ver todos los índices
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Ver todas las foreign keys
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE contype = 'f' 
-- ORDER BY conname;
