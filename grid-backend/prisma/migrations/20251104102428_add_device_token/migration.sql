/*
  Warnings:

  - A unique constraint covering the columns `[deviceToken]` on the table `device` will be added. If there are existing duplicate values, this will fail.
  - The required column `deviceToken` was added to the `device` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "device" ADD COLUMN     "deviceToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "device_deviceToken_key" ON "device"("deviceToken");
