import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getDeviceById, getDevicesByTenantId, createDevice, updateDevice, getDeviceGroupsByTenantId, createDeviceGroup, getDeviceGroupById, removeDeviceFromGroup, getDeviceByName, addDeviceToGroup, getDevicesByUserId } from "./deviceFunctions.ts";
import { verifySessionMiddleware } from "./middleware.ts";
import cors from "cors";
import dotenv from "dotenv";
import { createPolicy, deletePolicy, getDevicePolicies, getPoliciesByTenantId, getPolicyById, updatePolicy } from "./policyFunctions.ts";
import { createApp, deleteApp, getAppById, getAppsInGroup, getInstancesOfApp } from "./appFunctions.ts";
import { getResources } from "./keystone.ts";
import type { EnrollmentType } from "./generated/prisma/enums.ts";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use(cors({
    origin: "*"
}));

io.on("connection", async (socket) => {
    //Auth
    try {
        const device = await getDeviceById(socket.handshake.auth.deviceId);
        if (!device || device.deviceToken !== socket.handshake.auth.deviceToken) {
            return socket.disconnect();
        }
        device.online = true;
        device.changedStatusAt = new Date();
        var savedevice = structuredClone(device);
        savedevice.deviceGroupDevices = undefined;
        await updateDevice(savedevice);
        console.log("device connected: " + device.id);
        socket.join("device_" + device.id);
        device.deviceGroupDevices.forEach((deviceGroupDevice) => {
            socket.join("group_" + deviceGroupDevice.deviceGroupId);
        });
        console.log(socket.rooms);
        io.in("device_" + device.id).emit("device.connected");

        //policies
        socket.on("policy.get", async (ack) => {
            console.log("policy.get");
            const policies = await getDevicePolicies(device.id);
            // console.log(policies);
            ack(policies);
        });

        //update device info
        socket.on("deviceinfo.set", async (data) => {
            const device = await getDeviceById(socket.handshake.auth.deviceId);
            if (!device) {
                return;
            }
            device.os = data.os;
            device.osVersion = data.osVersion;
            device.architecture = data.architecture;
            const deviceSaved = structuredClone(device);
            deviceSaved.deviceGroupDevices = undefined;
            await updateDevice(deviceSaved);
        })

        //apps
        socket.on("app.getAssigned", async (ack) => {
            console.log("app.getAssigned");
            const apps: any[] = [];
            for (const deviceGroupDevice of device.deviceGroupDevices) {
                var groupApps = await getAppsInGroup(deviceGroupDevice.deviceGroupId);
                if (!groupApps) {
                    return;
                }
                groupApps.forEach((app) => {
                    if (!apps.find((a) => a.id === app.id)) {
                        apps.push(app);
                    }
                });
            }
            ack(apps);
        });

        //Disconnect
        socket.on("disconnect", async () => {
            const device = await getDeviceById(socket.handshake.auth.deviceId);
            var savedevice = structuredClone(device);
            savedevice.deviceGroupDevices = undefined;
            savedevice.online = false;
            savedevice.changedStatusAt = new Date();
            await updateDevice(savedevice);
        });
        setTimeout(() => {
            console.log(socket.rooms);
            io.in("device_" + device.id).emit("policy.refresh");
            io.in("device_" + device.id).emit("flatpak.sync");
            console.log("policy.refresh");
        }, 1000);
    } catch (e) {
        console.log(e);
        return socket.disconnect();
    }
});

//admin
app.use("/admin", verifySessionMiddleware({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appSecret: process.env.NEXT_PUBLIC_APP_SECRET! }));


//devices
app.post("/admin/device", async (req, res) => {
    const device = await createDevice({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        addedBy: req.sessionData.user.id,
        displayName: req.body.displayName || req.body.name,
    });
    res.send(device);
});

app.get("/admin/devices", async (req, res) => {
    const devices = await getDevicesByTenantId(req.sessionData.tenant.id);
    res.send(devices);
});

app.put("/admin/device/:id", async (req, res) => {
    const device = await getDeviceById(req.params.id);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    var newdevice = structuredClone(device);
    newdevice.deviceGroupDevices = undefined;
    var devicenew = await updateDevice({
        ...newdevice,
        name: req.body.name,
        displayName: req.body.displayName || req.body.name,
        assignedTo: req.body.assignedTo,
    });
    res.send(devicenew);
});

app.get("/admin/device/name/:name", async (req, res) => {
    const device = await getDeviceByName(req.params.name);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    const responses = await io.timeout(5000).in("device_" + device.id).emitWithAck("flatpak.list")
    res.send({
        ...device,
        flatpaks: responses[0],
    });
});

app.post("/admin/device/:id/refreshpolicy", async (req, res) => {
    const device = await getDeviceById(req.params.id);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    io.in("device_" + device.id).emit("policy.refresh");
    res.send({
        success: true,
        message: "Policy refreshed",
    });
});

app.post("/admin/device/:id/sendmessage", async (req, res) => {
    const device = await getDeviceById(req.params.id);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    io.in("device_" + device.id).emit("message.send", req.body);
    res.send({
        success: true,
        message: "Message sent",
    });
});

//deviceGroups

app.post("/admin/deviceGroup/:id/sendmessage", async (req, res) => {
    const deviceGroup = await getDeviceGroupById(req.params.id);
    if (!deviceGroup) {
        return res.status(404).send("Device group not found");
    }
    io.in("group_" + deviceGroup.id).emit("message.send", req.body);
    res.send({
        success: true,
        message: "Message sent",
    });
});

app.post("/admin/deviceGroup", async (req, res) => {
    const deviceGroup = await createDeviceGroup({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        createdBy: req.sessionData.user.id,
        displayName: req.body.displayName || req.body.name,
    });
    res.send(deviceGroup);
});

app.post("/admin/deviceGroup/:id/refreshpolicy", async (req, res) => {
    const deviceGroup = await getDeviceGroupById(req.params.id);
    if (!deviceGroup) {
        return res.status(404).send("Device group not found");
    }
    io.in("group_" + deviceGroup.id).emit("policy.refresh");
    res.send({
        success: true,
        message: "Policy refreshed",
    });
});

app.get("/admin/deviceGroups", async (req, res) => {
    const deviceGroups = await getDeviceGroupsByTenantId(req.sessionData.tenant.id);
    res.send(deviceGroups);
});

app.get("/admin/deviceGroup/:id", async (req, res) => {
    const deviceGroup = await getDeviceGroupById(req.params.id);
    if (!deviceGroup) {
        return res.status(404).send("Device group not found");
    }
    res.send(deviceGroup);
});

app.post("/admin/deviceGroup/:id/device", async (req, res) => {
    const deviceGroup = await getDeviceGroupById(req.params.id);
    if (!deviceGroup) {
        return res.status(404).send("Device group not found");
    }
    const device = await getDeviceById(req.body.deviceId);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    const deviceGroupDevice = await addDeviceToGroup({
        groupId: req.params.id,
        deviceId: req.body.deviceId,
    });
    res.send(deviceGroupDevice);
});

app.delete("/admin/deviceGroup/:id/device/:deviceId", async (req, res) => {
    const deviceGroup = await getDeviceGroupById(req.params.id);
    if (!deviceGroup) {
        return res.status(404).send("Device group not found");
    }
    const devices = await removeDeviceFromGroup({
        groupId: req.params.id,
        deviceId: req.params.deviceId,
    });
    res.send(devices);
});

//policies
app.get("/admin/policies", async (req, res) => {
    const policies = await getPoliciesByTenantId(req.sessionData.tenant.id);
    res.send(policies);
});

app.post("/admin/policy", async (req, res) => {
    const policy = await createPolicy({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        addedBy: req.sessionData.user.id,
        type: req.body.type,
        description: req.body.description,
        value: req.body.value,
        deviceGroup: {
            connect: {
                id: req.body.deviceGroupId,
            },
        },
    });
    res.send(policy);
    io.to("group_" + req.body.deviceGroupId).emit("policy.refresh");
});

app.get("/admin/policy/:id", async (req, res) => {
    const policy = await getPolicyById(req.params.id);
    if (!policy || policy.tenantId !== req.sessionData.tenant.id) {
        return res.status(404).send("Policy not found or not authorized");
    }
    res.send(policy);
});

app.put("/admin/policy/:id", async (req, res) => {
    console.log("Updating Policy")
    const policy = await getPolicyById(req.params.id);
    if (!policy || policy.tenantId !== req.sessionData.tenant.id) {
        return res.status(404).send("Policy not found or not authorized");
    }
    const updatedPolicy = await updatePolicy(req.body);
    res.send(updatedPolicy);
    io.to("group_" + req.body.deviceGroupId).emit("policy.refresh");
});

app.delete("/admin/policy/:id", async (req, res) => {
    const policy = await deletePolicy(req.params.id);
    res.send(policy);
});

//apps

app.get("/flathubproxy/*locpath", async (req, res) => {
    console.log("https://flathub.org/api/v2/" + req.params.locpath.join("/"));
    const response = await fetch("https://flathub.org/api/v2/" + req.params.locpath.join("/"), {
        headers: {
            "User-Agent": "chrome/120.0.0.0"
        },
    });
    res.send(await response.json());
});

app.post("/flathubproxy/*locpath", async (req, res) => {
    console.log("https://flathub.org/api/v2/" + req.params.locpath.join("/"));
    const response = await fetch("https://flathub.org/api/v2/" + req.params.locpath.join("/"), {
        headers: {
            "User-Agent": "chrome/120.0.0.0",
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        method: "POST",
        body: JSON.stringify(req.body),
    });
    res.send(await response.json());
});

app.get("/admin/apps", async (req, res) => {
    const apps = await getAppsByTenantId(req.sessionData.tenant.id);
    res.send(apps);
});

app.post("/admin/app", async (req, res) => {
    const app = await createApp({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        addedBy: req.sessionData.user.id,
        appId: req.body.appId,
        assignedToGroupId: req.body.assignedToGroupId,
        required: req.body.required,
    });
    io.to("group_" + req.body.assignedToGroupId).emit("flatpak.sync");
    res.send(app);
});

app.get("/admin/devicegroup/:id/apps", async (req, res) => {
    const apps = await getAppsInGroup(req.params.id);
    res.send(apps);
});

app.get("/admin/app/:id", async (req, res) => {
    const app = await getAppById(req.params.id);
    if (!app || app.tenantId !== req.sessionData.tenant.id) {
        return res.status(404).send("App not found or not authorized");
    }
    res.send(app);
});

app.get("/admin/appid/:id", async (req, res) => {
    const app = await getInstancesOfApp(req.params.id, req.sessionData.tenant.id);
    if (!app) {
        return res.status(404).send("App not found or not authorized");
    }
    res.send(app);
});

app.delete("/admin/app/:id", async (req, res) => {
    const app = await deleteApp(req.params.id);
    res.send(app);
    io.to("group_" + app.assignedToGroupId).emit("flatpak.sync");
});

app.get("/info/tenant/fromdevice", async (req, res) => {
    const device = await getDeviceById(req.query.deviceId as string);
    if (!device || device.deviceToken !== req.query.deviceToken) {
        return res.status(404).send({ error: "Device not found or not authorized" });
    }
    const resources = await getResources({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appSecret: process.env.NEXT_PUBLIC_APP_SECRET!, tenantId: device.tenantId });
    res.send({ tenant: resources.tenant });
});

app.post("/portal/selfenroll", async (req, res) => {
    const device = await createDevice({
        tenantId: req.sessionData.tenant.id,
        addedBy: req.sessionData.user.id,
        enrollmentType: EnrollmentType.SELFSERVICE,
    });
    res.send(device);
});

//users
app.use("/user", verifySessionMiddleware({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appSecret: process.env.NEXT_PUBLIC_APP_SECRET! }));

app.get("/user/devices", async (req, res) => {
    const devices = await getDevicesByUserId(req.sessionData.user.id);
    res.send(devices);
});

server.listen(3001, () => {
    console.log("listening on *:3001");
});
