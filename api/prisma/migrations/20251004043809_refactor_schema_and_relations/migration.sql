/*
  Warnings:

  - You are about to drop the column `descricao` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `assunto` on the `processos` table. All the data in the column will be lost.
  - You are about to drop the column `interessado` on the `processos` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `processos` table. All the data in the column will be lost.
  - The `status` column on the `processos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `data` to the `lancamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `historico` to the `lancamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `lancamentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `lancamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `credor` to the `processos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `processos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusProcesso" AS ENUM ('PENDENTE', 'LIQUIDADO');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('CREDITO', 'DEBITO');

-- DropForeignKey
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_processoId_fkey";

-- AlterTable
ALTER TABLE "lancamentos" DROP COLUMN "descricao",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "historico" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoLancamento" NOT NULL,
ALTER COLUMN "processoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "processos" DROP COLUMN "assunto",
DROP COLUMN "interessado",
DROP COLUMN "valor",
ADD COLUMN     "credor" TEXT NOT NULL,
ADD COLUMN     "empenhoNumero" TEXT,
ADD COLUMN     "empenhoVerba" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusProcesso" NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "processos" ADD CONSTRAINT "processos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "processos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
