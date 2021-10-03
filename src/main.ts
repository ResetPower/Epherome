import { app, BrowserWindow, ipcMain } from "electron";
import { mainLogger, parsed } from "./system";
import "./ms-auth";
import "./extension/loader";
import getTouchBar from "./touchbar";
import installExtension, {
  MOBX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import path from "path";

const prod = process.env.NODE_ENV === "production";

app.setName("Epherome");

const isTitleBarEph = parsed.titleBarStyle === "eph";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
    title: "Epherome",
    frame: !isTitleBarEph,
    transparent: isTitleBarEph,
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist/preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  if (process.platform === "darwin") {
    // is macos, set touch bar
    win.setTouchBar(getTouchBar(win));
    mainLogger.info("macOS Detected, set touch bar");
  }
  if (prod) {
    win.loadFile("dist/index.html");
  } else {
    win.loadURL("http://localhost:3000/dist");
  }
  if (!prod) {
    installExtension([REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS])
      .then((name) => mainLogger.info(`Added Extension: ${name}`))
      .catch((err) => mainLogger.error(`An error occurred: ${err}`));
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
