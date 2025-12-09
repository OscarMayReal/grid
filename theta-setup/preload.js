const { contextBridge } = require('electron')
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
