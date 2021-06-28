import { app, BrowserWindow } from "electron";
import touchBar from "./touchbar";
import { mainLogger, platform } from "./system";
import "./ms-auth";

const prod = process.env.NODE_ENV === "production";

function createWindow() {
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

  prod ? win.loadFile("dist/index.html") : win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
