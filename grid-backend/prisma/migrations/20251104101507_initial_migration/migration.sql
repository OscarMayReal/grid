-- CreateTable
CREATE TABLE "device" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMPUTER',
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "os" TEXT,
    "osVersion" TEXT,
    "architecture" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "offlineAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "deviceGroupId" TEXT NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),

    CONSTRAINT "DeviceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deviceGroupDevice" (
    "id" TEXT NOT NULL,
    "deviceGroupId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "deviceGroupDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deviceGroupDevice_deviceGroupId_deviceId_key" ON "deviceGroupDevice"("deviceGroupId", "deviceId");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_deviceGroupId_fkey" FOREIGN KEY ("deviceGroupId") REFERENCES "DeviceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deviceGroupDevice" ADD CONSTRAINT "deviceGroupDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deviceGroupDevice" ADD CONSTRAINT "deviceGroupDevice_deviceGroupId_fkey" FOREIGN KEY ("deviceGroupId") REFERENCES "DeviceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
