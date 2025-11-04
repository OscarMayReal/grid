/*
  Warnings:

  - Added the required column `displayName` to the `DeviceGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceGroup" ADD COLUMN     "displayName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "device" ADD COLUMN     "displayName" TEXT NOT NULL;
