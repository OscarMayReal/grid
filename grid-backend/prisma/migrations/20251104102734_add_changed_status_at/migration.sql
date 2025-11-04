/*
  Warnings:

  - You are about to drop the column `offlineAt` on the `device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "device" DROP COLUMN "offlineAt",
ADD COLUMN     "changedStatusAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
