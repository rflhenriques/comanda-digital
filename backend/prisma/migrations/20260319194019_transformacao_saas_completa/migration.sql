/*
  Warnings:

  - You are about to drop the column `ativo` on the `restaurantes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf,restaurante_id]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurante_id` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('BASICO', 'PRO', 'ENTERPRISE');

-- DropIndex
DROP INDEX "clientes_cpf_key";

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "restaurante_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "restaurantes" DROP COLUMN "ativo",
ADD COLUMN     "limite_mesas" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "plano" "Plano" NOT NULL DEFAULT 'BASICO',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO';

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_restaurante_id_key" ON "clientes"("cpf", "restaurante_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
