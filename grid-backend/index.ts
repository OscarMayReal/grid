import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getDeviceById, updateDevice } from "./deviceFunctions";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

io.on("connection", async (socket) => {
    const device = await getDeviceById(socket.handshake.auth.deviceId);
    if (!device || device.deviceToken !== socket.handshake.auth.deviceToken) {
        return socket.disconnect();
    }
    device.online = true;
    device.changedStatusAt = new Date();
    await updateDevice({device: device});
    socket.join("device_" + device.id);
    socket.to("device_" + device.id).emit("policies.refresh");
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});
