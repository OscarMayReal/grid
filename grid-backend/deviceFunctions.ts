import { PrismaClient } from "./generated/prisma/client.ts";
import type { device, DeviceGroup } from './generated/prisma/client.ts';

const prisma = new PrismaClient();

export async function getDevicesByTenantId(tenantId: string) {
    return await prisma.device.findMany({
        where: {
            tenantId: tenantId
        },
        include: {
            deviceGroupDevices: {
                include: {
                    deviceGroup: true
                }
            },
        }
    });
}

export async function createDevice(data: device) {
    return await prisma.device.create({
        data: data
    });
}

export async function createDeviceGroup(data: DeviceGroup) {
    return await prisma.deviceGroup.create({
        data: data
    });
}

export async function getDeviceGroupsByTenantId(tenantId: string) {
    return await prisma.deviceGroup.findMany({
        where: {
            tenantId: tenantId
        },
        include: {
            _count: {
                select: {
                    deviceGroupDevices: true
                }
            },
            deviceGroupDevices: {
                include: {
                    device: true
                }
            }
        }
    });
}

export async function getDeviceByName(name: string) {
    return await prisma.device.findUnique({
        where: {
            name: name
        }
    });
}

export function getDeviceGroupById(id: string) {
    return prisma.deviceGroup.findUnique({
        where: {
            id: id
        },
        include: {
            deviceGroupDevices: {
                include: {
                    device: true
                }
            }
        }
    });
}

export function updateDeviceGroup(data: DeviceGroup) {
    return prisma.deviceGroup.update({
        where: {
            id: data.id
        },
        data: data
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
        },
        include: {
            deviceGroupDevices: {
                include: {
                    deviceGroup: true
                }
            }
        }
    });
}

export function updateDevice(data: device) {
    return prisma.device.update({
        where: {
            id: data.id
        },
        data: data
    });
}

export function deleteDevice(id: string) {
    return prisma.device.delete({
        where: {
            id: id
        }
    });
}

export async function addDeviceToGroup({
    groupId,
    deviceId,
}: {
    groupId: string;
    deviceId: string;
}) {
    return await prisma.deviceGroupDevice.create({
        data: {
            deviceGroupId: groupId,
            deviceId: deviceId,
        },
        include: {
            device: true
        }
    });
}

export function removeDeviceFromGroup({
    groupId,
    deviceId,
}: {
    groupId: string;
    deviceId: string;
}) {
    return prisma.deviceGroupDevice.delete({
        where: {
            deviceGroupId_deviceId: {
                deviceGroupId: groupId,
                deviceId: deviceId,
            },
        }
    });
}