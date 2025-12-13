const { contextBridge, ipcRenderer } = require('electron')
const wifi = require('node-wifi')
const fs = require("fs/promises")
const os = require("os")

wifi.init({
  iface: null // auto-detect
})

contextBridge.exposeInMainWorld("wifi", {
  scan: () => wifi.scan(),
  connect: (opts) => wifi.connect(opts),
  disconnect: () => wifi.disconnect(),
  getCurrentConnections: () => wifi.getCurrentConnections()
})

contextBridge.exposeInMainWorld("cookie", {
  get: () => ipcRenderer.sendSync("get-cookie"),
  set: (cookie) => ipcRenderer.send("set-cookie", cookie)
})

contextBridge.exposeInMainWorld("fs", {
  readFile: (path) => fs.readFile(path, "utf-8"),
  writeFile: (path, data) => fs.writeFile(path, data),
  mkdir: (path) => fs.mkdir(path),
  access: (path) => fs.access(path),
  delete: (path) => fs.rm(path)
})

contextBridge.exposeInMainWorld("os", {
  homeDir: () => os.homedir(),
})
