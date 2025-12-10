-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('SELFSERVICE', 'ADMIN');

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "autoInstall" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "device" ADD COLUMN     "enrollmentType" "EnrollmentType" NOT NULL DEFAULT 'ADMIN';
