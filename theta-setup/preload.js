const { contextBridge, ipcRenderer } = require('electron')
const wifi = require('node-wifi')


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