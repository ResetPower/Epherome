import { app, BrowserWindow, ipcMain } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  MOBX_DEVTOOLS,
} from "electron-devtools-installer";
import touchBar from "./touchbar";
import { mainLogger, platform } from "./system";
import "./ms-auth";

const prod = process.env.NODE_ENV === "production";

function createWindow() {
  if (!prod) {
    installExtension([REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS])
      .then((name) => mainLogger.info(`Added Extension: ${name}`))
      .catch((err) => mainLogger.error(`An error occurred: ${err}`));
  }
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    resizable: false,
    title: "Epherome",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  if (platform === "darwin") {
    // is macos, set touch bar
    win.setTouchBar(touchBar(win));
    mainLogger.info("macOS Detected, set touch bar");
  }
  if (prod) {
    win.loadFile("dist/index.html");
  } else {
    win.loadURL("http://localhost:3000");
  }

  ipcMain.on("open-devtools", () => win.webContents.openDevTools());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
