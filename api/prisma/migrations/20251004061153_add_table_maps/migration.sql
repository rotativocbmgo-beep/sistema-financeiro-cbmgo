/*
  Warnings:

  - You are about to alter the column `valor` on the `lancamentos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `address` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `user_settings` table. All the data in the column will be lost.
  - Made the column `empenhoNumero` on table `processos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empenhoVerba` on table `processos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lancamentos" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "processos" ALTER COLUMN "empenhoNumero" SET NOT NULL,
ALTER COLUMN "empenhoVerba" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "address",
DROP COLUMN "cnpj",
DROP COLUMN "companyName",
DROP COLUMN "logoUrl";
