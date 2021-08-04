import { ipcMain, dialog, app } from "electron";
import os from "os";
import log4js from "log4js";
import log4jsConfiguration from "../tools/logging";
import path from "path";
import fs from "fs";

const version = app.getVersion();
const dir = app.getPath("userData"); // config file and application data directory

const logFilename = path.join(dir, "latest.log");

try {
  fs.writeFileSync(logFilename, "");
} catch {}

// configure log4js
log4js.configure(log4jsConfiguration(logFilename));

ipcMain.on("get-user-data-path", (ev) => {
  ev.returnValue = dir;
});

ipcMain.on("get-version", (ev) => {
  ev.returnValue = version;
});

// deal open folder action
ipcMain.handle("open-directory", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!files.canceled) {
    return files.filePaths[0];
  } else return undefined;
});

ipcMain.on("quit", () => {
  app.quit();
});

// global main-process logger
export const mainLogger = log4js.getLogger("main");

export const platform = os.platform();
export const arch = os.arch();
export const release = os.release();

mainLogger.info(`*** Epherome ${version} ***`);
mainLogger.info(`Epherome  Copyright (C) 2021  ResetPower`);
mainLogger.info(`Epherome is running on ${process.env.NODE_ENV} mode`);
mainLogger.info(`Operating System: ${platform} ${arch} ${release}`);
mainLogger.info(`Node.js Version: ${process.versions.node}`);
mainLogger.info(`V8 Version: ${process.versions.v8}`);
mainLogger.info(`Chrome Version: ${process.versions.chrome}`);
mainLogger.info(`Electron Version: ${process.versions.electron}`);
mainLogger.info(`Epherome directory: '${dir}'`);
