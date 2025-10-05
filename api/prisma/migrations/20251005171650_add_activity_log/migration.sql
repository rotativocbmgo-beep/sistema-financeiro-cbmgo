/*
  Warnings:

  - You are about to drop the column `receber_notificacoes_pagamento` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `receber_notificacoes_processo` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `receber_notificacoes_reposicao` on the `user_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "receber_notificacoes_pagamento",
DROP COLUMN "receber_notificacoes_processo",
DROP COLUMN "receber_notificacoes_reposicao";

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
