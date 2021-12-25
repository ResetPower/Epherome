import { app, BrowserWindow, ipcMain } from "electron";
import { mainLogger, parsed } from "./system";
import "./ms-auth";
import getTouchBar from "./touchbar";
import path from "path";

// Prevent Electron Security Warning (Insecure Content-Security-Policy)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

app.setName("Epherome");

function createWindow() {
  const isTitleBarEph = parsed.titleBarStyle === "eph";
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
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

  win.loadURL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "dist/index.html"
  );

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

// prevent redirection
app.on("web-contents-created", (_, contents) =>
  contents.on("will-navigate", (event) => event.preventDefault())
);
