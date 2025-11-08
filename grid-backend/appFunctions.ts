import { PrismaClient } from "./generated/prisma/client.ts";
import type { App } from './generated/prisma/client.ts';

const prisma = new PrismaClient();

export async function getAppById(id: string) : Promise<App | null> {
    return await prisma.app.findUnique({
        where: {
            id: id
        }
    });
}

export async function getInstancesOfApp(appId: string, tenantId: string) : Promise<App[] | null> {
    return await prisma.app.findMany({
        where: {
            appId: appId,
            tenantId: tenantId
        }
    });
}

export async function getAppsInGroup(groupid: string) : Promise<App[] | null> {
    return await prisma.app.findMany({
        where: {
            assignedToGroupId: groupid
        }
    });
}

export async function createApp(app: App) : Promise<App> {
    return await prisma.app.create({
        data: app
    });
}

export function deleteApp(id: string) : Promise<App> {
    return prisma.app.delete({
        where: {
            id: id
        }
    });
}