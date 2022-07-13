import { app, BrowserWindow, ipcMain } from "electron";
import { mainLogger, parsed } from "./system";
import "./ms-auth";
import getTouchBar from "./touchbar";
import path from "path";
import "./loader";

const prod = process.env.NODE_ENV !== "development";

// Prevent Electron Security Warning (Insecure Content-Security-Policy)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

app.setName("Epherome");

function createWindow() {
  const isTitleBarEph = parsed.titleBarStyle === "eph";
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    title: "Epherome",
    frame: !isTitleBarEph,
    transparent: isTitleBarEph,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(app.getAppPath(), "dist/preload.js"),
    },
  });

  if (process.platform === "darwin") {
    // is macos, set touch bar
    win.setTouchBar(getTouchBar());
    mainLogger.info("macOS Detected, set touch bar");
    mainLogger.info("Wish your Mac has a touch bar...");
  }

  if (prod) {
    win.loadFile("dist/index.html");
  } else {
    win.loadURL("http://localhost:3000");
  }

  ipcMain.on("quit", () => win.close());
  ipcMain.on("minimize", () => win.minimize());
  ipcMain.on("open-devtools", () => win.webContents.openDevTools());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
