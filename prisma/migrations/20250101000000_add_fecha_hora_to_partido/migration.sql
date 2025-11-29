-- AlterTable
ALTER TABLE "partido" ADD COLUMN "fechaHora" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "partido_fechaHora_idx" ON "partido"("fechaHora");




