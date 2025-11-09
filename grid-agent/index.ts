import { io } from "socket.io-client";
import { applyPolicy } from "./policyApplicator.ts";
import pkg from "freedesktop-notifications";
const { Notification } = pkg;
import os from "os";
import { FlatpakWrapper } from "./flatpak.ts";
import download from "download";
import { GLib } from "@girs/node-glib-2.0";
import { init } from "./frontend.ts";
import fs from "fs";
import { memoryUsage } from "process";
import { exec } from "child_process";

function loadConfig() {
    if (fs.existsSync("./config.json")) {
        return JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    } else {
        init();
        return null;
    }
}

const config = loadConfig();

if (config) {
    const socket = io(config.serverUrl, {
        auth: {
            deviceId: config.deviceId,
            deviceToken: config.deviceToken
        },
        autoConnect: false
    });

    const flatpak = new FlatpakWrapper();

    function syncFlatpak() {
        console.log("Syncing flatpak");
        const installation = flatpak.getUserInstallation();
        const refs = installation.listInstalledRefs(null);
        const transaction = flatpak.flatpak.Transaction.newForInstallation(installation, null);
        socket.emit("app.getAssigned", async (data: any) => {
            refs.forEach((ref) => {
                if (!data.filter((app: any) => app.appId === ref.getName()).length && ref.getKind() === 0) {
                    console.log("Uninstalling " + ref.getName());
                    transaction.addUninstall(ref.formatRef());
                }
            });
            if (installation.listRemotes(null).filter((remote) => remote.getName() === "flathub").length === 0) {
                var data = await download("https://dl.flathub.org/repo/flathub.flatpakrepo");
                const remote = flatpak.flatpak.Remote.newFromFile("flathub", new GLib.Bytes(data));
                installation.addRemote(remote, true, null);
            }
            for (const app of data) {
                if (!refs.filter((ref: any) => ref.getName() === app.appId).length) {
                    const result = await fetch("https://flathub.org/api/v2/summary/" + app.appId, {
                        method: "GET",
                    });
                    const data = await result.json();
                    // console.log(data);
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
                var notification = new Notification({
                    summary: "Grid Agent",
                    body: "Done: " + op.getRef(),
                });
                notification.push();
            });
            // transaction.on("operation-error", (op, err, details) => {
            //     console.log("Error: " + op.getRef() + " " + details);
            //     var notification = new Notification({
            //         summary: "Grid Agent",
            //         body: "Error: " + op.getRef() + " " + details,
            //     });
            //     notification.push();
            // });
            transaction.on("new-operation", (op, progress) => {
                console.log("Starting: " + op.getRef());
                progress.on("changed", () => {
                    const p = progress.getProgress();
                    const status = progress.getStatus();
                    process.stdout.write(`[${p}%] ${status}\r`);
                });
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
        const installation = flatpak.getUserInstallation();
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

    socket.on("system.status", async (ack) => {
        var status = {
            os: os.type(),
            osVersion: os.release(),
            architecture: os.arch(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpuUsage: os.cpus(),
            networkInterfaces: os.networkInterfaces(),
            uptime: os.uptime(),
            loadavg: os.loadavg(),
            platform: os.platform(),
            release: os.release(),
            hostname: os.hostname(),
            homedir: os.homedir(),
            tmpdir: os.tmpdir(),
            userInfo: os.userInfo(),
            cpus: os.cpus(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
        }
        ack(status);
    });

    socket.on("message.send", (data: any) => {
        exec("zenity --info --text='" + data.message + "' --title='Message From Device Admin'");
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

}