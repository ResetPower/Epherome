import { ipcMain, dialog, app } from "electron";
import os from "os";
import log from "electron-log";

// epherome application constraints
const version = "0.0.4"; // major.minor.patch
const platform = os.platform(); // operating system name
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
export const main = log.scope("main");

main.info(`*** Epherome ${version} ***`);
main.info(`Operating System: ${platform} ${arch} ${release}`);
main.info(`Node.js Version: ${process.versions.node}`);
main.info(`Electron Version: ${process.versions.electron}`);
main.info(`Chrome Version: ${process.versions.chrome}`);
main.info(`V8 Version: ${process.versions.v8}`);
main.info(`Epherome directory: ${dir}`);
main.info(`"JAVA_HOME": ${javaHome}`);
