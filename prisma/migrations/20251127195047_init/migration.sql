-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo" (
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

-- CreateTable
CREATE TABLE "jugador" (
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

-- CreateTable
CREATE TABLE "fecha" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT,
    "slug" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fecha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partido" (
    "id" TEXT NOT NULL,
    "fechaId" TEXT NOT NULL,
    "equipoLocalId" TEXT NOT NULL,
    "equipoVisitanteId" TEXT NOT NULL,
    "golesLocal" INTEGER NOT NULL DEFAULT 0,
    "golesVisitante" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gol" (
    "id" TEXT NOT NULL,
    "partidoId" TEXT NOT NULL,
    "jugadorId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "esPenal" BOOLEAN NOT NULL DEFAULT false,
    "esAutogol" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicidad" (
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

-- CreateTable
CREATE TABLE "noticia" (
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

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_nombre_key" ON "equipo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_slug_key" ON "equipo"("slug");

-- CreateIndex
CREATE INDEX "equipo_estado_idx" ON "equipo"("estado");

-- CreateIndex
CREATE INDEX "equipo_vidas_idx" ON "equipo"("vidas");

-- CreateIndex
CREATE INDEX "equipo_slug_idx" ON "equipo"("slug");

-- CreateIndex
CREATE INDEX "jugador_equipoId_idx" ON "jugador"("equipoId");

-- CreateIndex
CREATE INDEX "jugador_estado_idx" ON "jugador"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "fecha_numero_key" ON "fecha"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "fecha_slug_key" ON "fecha"("slug");

-- CreateIndex
CREATE INDEX "fecha_numero_idx" ON "fecha"("numero");

-- CreateIndex
CREATE INDEX "fecha_slug_idx" ON "fecha"("slug");

-- CreateIndex
CREATE INDEX "partido_fechaId_idx" ON "partido"("fechaId");

-- CreateIndex
CREATE INDEX "partido_estado_idx" ON "partido"("estado");

-- CreateIndex
CREATE INDEX "partido_equipoLocalId_idx" ON "partido"("equipoLocalId");

-- CreateIndex
CREATE INDEX "partido_equipoVisitanteId_idx" ON "partido"("equipoVisitanteId");

-- CreateIndex
CREATE INDEX "gol_partidoId_idx" ON "gol"("partidoId");

-- CreateIndex
CREATE INDEX "gol_jugadorId_idx" ON "gol"("jugadorId");

-- CreateIndex
CREATE INDEX "gol_equipoId_idx" ON "gol"("equipoId");

-- CreateIndex
CREATE INDEX "publicidad_activa_idx" ON "publicidad"("activa");

-- CreateIndex
CREATE INDEX "publicidad_orden_idx" ON "publicidad"("orden");

-- CreateIndex
CREATE INDEX "noticia_tipo_idx" ON "noticia"("tipo");

-- CreateIndex
CREATE INDEX "noticia_orden_idx" ON "noticia"("orden");

-- AddForeignKey
ALTER TABLE "jugador" ADD CONSTRAINT "jugador_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partido" ADD CONSTRAINT "partido_fechaId_fkey" FOREIGN KEY ("fechaId") REFERENCES "fecha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partido" ADD CONSTRAINT "partido_equipoLocalId_fkey" FOREIGN KEY ("equipoLocalId") REFERENCES "equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partido" ADD CONSTRAINT "partido_equipoVisitanteId_fkey" FOREIGN KEY ("equipoVisitanteId") REFERENCES "equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gol" ADD CONSTRAINT "gol_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gol" ADD CONSTRAINT "gol_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "jugador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gol" ADD CONSTRAINT "gol_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
