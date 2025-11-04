import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getDeviceById, getDevicesByTenantId, createDevice, updateDevice, getDeviceGroupsByTenantId, createDeviceGroup, getDeviceGroupById, removeDeviceFromGroup } from "./deviceFunctions.ts";
import { verifySessionMiddleware } from "./middleware.ts";
import cors from "cors";
import dotenv from "dotenv";
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
        await updateDevice(device);
        socket.join("device_" + device.id);
        socket.to("device_" + device.id).emit("policies.refresh");

        //Disconnect
        socket.on("disconnect", async () => {
            device.online = false;
            device.changedStatusAt = new Date();
            await updateDevice(device);
        });
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
    });
    res.send(device);
});

app.get("/admin/devices", async (req, res) => {
    const devices = await getDevicesByTenantId(req.sessionData.tenant.id);
    res.send(devices);
});

//deviceGroups
app.post("/admin/deviceGroup", async (req, res) => {
    const deviceGroup = await createDeviceGroup({
        name: req.body.name,
        tenantId: req.sessionData.tenant.id,
        createdBy: req.sessionData.user.id,
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
    const devices = await getDevicesByTenantId(req.sessionData.tenant.id);
    res.send(devices);
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

server.listen(3001, () => {
    console.log("listening on *:3001");
});
