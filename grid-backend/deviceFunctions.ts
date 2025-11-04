import { device, DeviceGroup, PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

export async function getDevicesByTenantId(tenantId: string) {
    return await prisma.device.findMany({
        where: {
            tenantId: tenantId
        }
    });
}

export async function createDevice({device}: {device: device}) {
    return await prisma.device.create({
        data: device
    });
}

export async function createDeviceGroup({deviceGroup}: {deviceGroup: DeviceGroup}) {
    return await prisma.deviceGroup.create({
        data: deviceGroup
    });
}

export async function getDeviceGroupsByTenantId(tenantId: string) {
    return await prisma.deviceGroup.findMany({
        where: {
            tenantId: tenantId
        }
    });
}

export function getDeviceGroupById(id: string) {
    return prisma.deviceGroup.findUnique({
        where: {
            id: id
        }
    });
}

export function updateDeviceGroup({deviceGroup}: {deviceGroup: DeviceGroup}) {
    return prisma.deviceGroup.update({
        where: {
            id: deviceGroup.id
        },
        data: deviceGroup
    });
}

export function deleteDeviceGroup(id: string) {
    return prisma.deviceGroup.delete({
        where: {
            id: id
        }
    });
}

export function getDeviceById(id: string) {
    return prisma.device.findUnique({
        where: {
            id: id
        }
    });
}

export function updateDevice({device}: {device: device}) {
    return prisma.device.update({
        where: {
            id: device.id
        },
        data: device
    });
}

export function deleteDevice(id: string) {
    return prisma.device.delete({
        where: {
            id: id
        }
    });
}
