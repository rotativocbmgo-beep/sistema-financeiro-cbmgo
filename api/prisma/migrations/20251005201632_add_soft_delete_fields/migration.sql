-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "processos" ADD COLUMN     "deletedAt" TIMESTAMP(3);
