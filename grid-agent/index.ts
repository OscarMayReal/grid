const serverurl = "http://192.168.1.210:3001";
// const serverurl = "http://10.192.31.159:3001";
// const serverurl = "http://172.16.185.133:3001";
import { io } from "socket.io-client";
import { applyPolicy } from "./policyApplicator.ts";
import pkg from "freedesktop-notifications";
const { Notification } = pkg;
import os from "os";
import { FlatpakWrapper } from "./flatpak.ts";
const socket = io(serverurl, {
    auth: {
        deviceId: "cmhkkibu70000q0s91dzr7ldh",
        deviceToken: "cmhkkibu80001q0s91rxgrybq"
    },
    autoConnect: false
});

const flatpak = new FlatpakWrapper();

function syncFlatpak() {
    console.log("Syncing flatpak");
    const installation = flatpak.getSystemInstallation();
    const refs = installation.listInstalledRefs(null);
    const transaction = flatpak.flatpak.Transaction.newForInstallation(installation, null);
    socket.emit("app.getAssigned", async (data: any) => {
        refs.forEach((ref) => {
            if (!data.filter((app: any) => app.appId === ref.getName()).length && ref.getKind() === 0) {
                console.log("Uninstalling " + ref.getName());
                transaction.addUninstall(ref.formatRef());
            }
        });
        for (const app of data) {
            if (!refs.filter((ref: any) => ref.getName() === app.appId).length) {
                const result = await fetch("https://flathub.org/api/v2/summary/" + app.appId, {
                    method: "GET",
                });
                const data = await result.json();
                if (data.arches.includes(os.arch() == "x64" ? "x86_64" : "aarch64")) {
                    console.log("Installing " + app.appId);
                    transaction.addInstall("flathub", "app/" + app.appId + "/" + (os.arch() == "x64" ? "x86_64" : "aarch64") +  "/stable", null);
                } else {
                    console.log("Unsupported architecture for " + app.appId);
                }
            }
        }
        transaction.on("operation-done", (op, result) => {
            console.log("Done: " + op.getRef());
        });
        transaction.on("operation-error", (op, err, details) => {
            console.log("Error: " + op.getRef() + " " + err);
        });
        transaction.run(null)
    });
}
    

socket.on("policy.refresh", () => {
    console.log("Refreshing policies");
    console.log("")
    setTimeout(() => {
        socket.emit("policy.get", async (data: any) => {
            // console.log(data);
            const time = process.hrtime();
            const result = await applyPolicy(data);
            const finalTime = process.hrtime(time);
            console.log("Applied " + result.count + " policy(ies) in " + finalTime[1] / 1000000 + " ms");
            const notification = new Notification({
                summary: "Grid Agent",
                body: "Applied " + result.count + " policy(ies) in " + finalTime[1] / 1000000 + " ms",
            });
            notification.push();
        });
    }, 2000);
});

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("flatpak.list", (ack: any) => {
    console.log("Installing flatpak");
    const installation = flatpak.getSystemInstallation();
    const refs = installation.listInstalledRefs(null);
    const formattedRefs = refs.map((ref) => {
        return {
            appid: ref.getName(),
            name: ref.getAppdataName(),
            version: ref.getAppdataVersion(),
            summary: ref.getAppdataSummary(),
            kind: ref.getKind(),
            origin: ref.getOrigin(),
        };
    });
    ack(formattedRefs);
});

socket.on("flatpak.sync", async (data: any) => {
    syncFlatpak();
});

socket.on("device.connected", (data: any) => {
    console.log("authenticated successfully");
    const notification = new Notification({
        summary: "Grid Agent",
        body: "Authenticated successfully",
    });
    notification.push();
    socket.emit("deviceinfo.set", {
        os: os.type(),
        osVersion: os.release(),
        architecture: os.arch(),
    });
    setInterval(() => {
        syncFlatpak();
    }, 60 * 1000 * 10);
});

socket.connect();