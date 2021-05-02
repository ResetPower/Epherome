import { app, BrowserWindow } from "electron";
import "./system";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.on("ready-to-show", win.show);

  process.env.NODE_ENV === "production"
    ? win.loadFile("dist/index.html")
    : win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
