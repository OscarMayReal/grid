/*
  Warnings:

  - You are about to drop the column `addedAt` on the `DeviceGroup` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `DeviceGroup` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `DeviceGroup` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `DeviceGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceGroup" DROP COLUMN "addedAt",
DROP COLUMN "assignedAt",
DROP COLUMN "assignedTo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
