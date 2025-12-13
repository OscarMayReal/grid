import { app, BrowserWindow, ipcMain } from "electron";
import path from "path"

const __dirname = import.meta.dirname;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false
    }
  })

  win.loadFile('dist/index.html')
  // win.loadURL('http://localhost:5173')
  win.setFullScreen(true)
  win.setKiosk(true)
  ipcMain.on("set-cookie", (event, cookie) => {
    win.webContents.session.cookies.set(cookie)
  })
  ipcMain.on("get-cookie", (event) => {
    win.webContents.session.cookies.get({ name: "auth" }).then((cookie) => {
      event.reply("get-cookie", cookie)
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})