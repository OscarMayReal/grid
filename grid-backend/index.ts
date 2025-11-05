import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getDeviceById, getDevicesByTenantId, createDevice, updateDevice, getDeviceGroupsByTenantId, createDeviceGroup, getDeviceGroupById, removeDeviceFromGroup, getDeviceByName, addDeviceToGroup } from "./deviceFunctions.ts";
import { verifySessionMiddleware } from "./middleware.ts";
import cors from "cors";
import dotenv from "dotenv";
import { createPolicy, deletePolicy, getDevicePolicies, getPoliciesByTenantId, getPolicyById, updatePolicy } from "./policyFunctions.ts";
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

        //Disconnect
        socket.on("disconnect", async () => {
            var savedevice = structuredClone(device);
            savedevice.deviceGroupDevices = undefined;
            savedevice.online = false;
            savedevice.changedStatusAt = new Date();
            await updateDevice(savedevice);
        });
        setTimeout(() => {
            console.log(socket.rooms);
            io.in("device_" + device.id).emit("policy.refresh");
            console.log("policy.refresh");
        }, 1000);
    } catch (e) {
        console.log(e);
        return socket.disconnect();
    }
});

//admin
app.use("/admin", verifySessionMiddleware({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appSecret: process.env.NEXT_PUBLIC_APP_SECRET!}));


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

app.get("/admin/device/name/:name", async (req, res) => {
    const device = await getDeviceByName(req.params.name);
    if (!device) {
        return res.status(404).send("Device not found");
    }
    res.send(device);
});

//deviceGroups
app.post("/admin/deviceGroup", async (req, res) => {
    const deviceGroup = await createDeviceGroup({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        createdBy: req.sessionData.user.id,
        displayName: req.body.displayName || req.body.name,
    });
    res.send(deviceGroup);
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

server.listen(3001, () => {
    console.log("listening on *:3001");
});
