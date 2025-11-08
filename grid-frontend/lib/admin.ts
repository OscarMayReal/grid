import { getAuth } from "keystone-lib";

export async function getDeviceByName(name: string) {
    const auth = await getAuth({
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!,
    });
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + `/admin/device/name/${name}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${auth.data?.sessionId}`
        }
    });
    return await res.json();
}

export async function addDeviceToGroup(deviceId: string, deviceGroupId: string) {
    const auth = await getAuth({
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!,
    });
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + `/admin/devicegroup/${deviceGroupId}/device`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${auth.data?.sessionId}`
        },
        body: JSON.stringify({
            deviceId: deviceId
        })
    });
    return await res.json();
}

export async function removeDeviceFromGroup(deviceId: string, deviceGroupId: string) {
    const auth = await getAuth({
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!,
    });
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + `/admin/devicegroup/${deviceGroupId}/device/${deviceId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${auth.data?.sessionId}`
        },
    });
    return await res.json();
}

export async function removeAppFromGroup(appId: string) {
    const auth = await getAuth({
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!,
    });
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + `/admin/app/${appId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${auth.data?.sessionId}`
        },
    });
    return await res.json();
}

