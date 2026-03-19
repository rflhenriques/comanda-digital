-- CreateEnum
CREATE TYPE "StatusCaixa" AS ENUM ('ABERTO', 'FECHADO');

-- CreateTable
CREATE TABLE "caixas" (
    "id" TEXT NOT NULL,
    "valor_inicial" DECIMAL(10,2) NOT NULL,
    "valor_final" DECIMAL(10,2),
    "status" "StatusCaixa" NOT NULL DEFAULT 'ABERTO',
    "aberto_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechado_em" TIMESTAMP(3),
    "restaurante_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "caixas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "caixas" ADD CONSTRAINT "caixas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixas" ADD CONSTRAINT "caixas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
