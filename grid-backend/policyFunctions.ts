import { PrismaClient } from "./generated/prisma/client.ts";
import type { device, DeviceGroup, Policy } from './generated/prisma/client.ts';

const prisma = new PrismaClient();

export async function getDevicePolicies(deviceId: string) {
    return await prisma.policy.findMany({
        where: {
            deviceGroup: {
                deviceGroupDevices: {
                    some: {
                        deviceId: deviceId
                    }
                }
            }
        }
    });
}

export async function createPolicy(data: Policy) {
    return await prisma.policy.create({
        data: data
    });
}

export async function updatePolicy(data: Policy) {
    return await prisma.policy.update({
        where: {
            id: data.id
        },
        data: data
    });
}

export async function deletePolicy(id: string) {
    return await prisma.policy.delete({
        where: {
            id: id
        }
    });
}

export async function getPoliciesByTenantId(tenantId: string) {
    return await prisma.policy.findMany({
        where: {
            tenantId: tenantId
        }
    });
}

export async function getPolicyById(id: string) {
    return await prisma.policy.findUnique({
        where: {
            id: id
        }
    });
}
