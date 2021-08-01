import { ipcMain, dialog, app } from "electron";
import { Logger } from "../tools/logger";
import os from "os";

const version = app.getVersion();
const dir = app.getPath("userData"); // config file and application data directory

ipcMain.on("getUserDataPath", (ev) => {
  ev.returnValue = dir;
});

ipcMain.on("getVersion", (ev) => {
  ev.returnValue = version;
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

ipcMain.on("quit", () => {
  app.quit();
});

// global main-process logger
export const mainLogger = new Logger("Main");

export const platform = os.platform();
export const arch = os.arch();
export const release = os.release();

mainLogger.info(`*** Epherome ${version} ***`);
mainLogger.info(`Epherome  Copyright (C) 2021  ResetPower`);
mainLogger.info(`Epherome is running on ${process.env.NODE_ENV} mode`);
mainLogger.info(`Operating System: ${platform} ${arch} ${release}`);
mainLogger.info(`Epherome directory: '${dir}'`);
