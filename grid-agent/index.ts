const serverurl = "http://192.168.1.210:3001";
import { io } from "socket.io-client";
import { applyPolicy } from "./policyApplicator.ts";
import pkg from "freedesktop-notifications";
const { Notification } = pkg;
const socket = io(serverurl, {
    auth: {
        deviceId: "cmhkkibu70000q0s91dzr7ldh",
        deviceToken: "cmhkkibu80001q0s91rxgrybq"
    },
    autoConnect: false
});

socket.on("policy.refresh", () => {
    console.log("Refreshing policies");
    setTimeout(() => {
        socket.emit("policy.get", async (data: any) => {
            const time = process.hrtime();
            await applyPolicy(data);
            const finalTime = process.hrtime(time);
            console.log("Applied " + data.length + " policy(ies) in " + finalTime[1] / 1000000 + " ms");
            const notification = new Notification({
                summary: "Grid Agent",
                body: "Applied " + data.length + " policy(ies) in " + finalTime[1] / 1000000 + " ms",
            });
            notification.push();
        });
    }, 2000);
});

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("device.connected", (data: any) => {
    console.log("authenticated successfully");
    const notification = new Notification({
        summary: "Grid Agent",
        body: "Authenticated successfully",
    });
    notification.push();
});

socket.connect();

