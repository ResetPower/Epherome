import { app, BrowserWindow } from "electron";
import touchBar from "./touchbar";
import "./system";
import "./proxy";

const prod = process.env.NODE_ENV === "production";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.setTouchBar(touchBar(win));

  prod ? win.loadFile("dist/index.html") : win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
