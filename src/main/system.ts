import { ipcMain, dialog, app } from "electron";
import os from "os";
import { Logger } from "../tools/logging";

// epherome application constraints
const version = "0.0.5"; // major.minor.patch
export const platform = os.platform(); // operating system name
const arch = os.arch(); // operating system arch
const release = os.release(); // operating system release version
const dir = app.getPath("userData"); // config file and application data directory
const javaHome = process.env["JAVA_HOME"] ?? "java"; // environment variable JAVA_HOME

ipcMain.on("initialize", (ev) => {
  // Epherome Version, OS Platform, OS Arch, OS Release, Epherome Directory, JAVA_HOME
  ev.returnValue = {
    version,
    platform,
    arch,
    release,
    dir,
    javaHome,
  };
});

// deal open folder action
ipcMain.on("openDirectory", (ev) => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then((files) => {
      if (!files.canceled) {
        ev.sender.send("replyOpenDirectory", files.filePaths[0]);
      }
    });
});

// global main-process logger
export const mainLogger = new Logger("Main");

mainLogger.info(`*** Epherome ${version} ***`);
mainLogger.info(`Epherome is running on ${process.env.NODE_ENV} mode`);
mainLogger.info(`Operating System: ${platform} ${arch} ${release}`);
mainLogger.info(`Epherome directory: '${dir}'`);
