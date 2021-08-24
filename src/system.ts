import { ipcMain, dialog, app } from "electron";
import os from "os";
import fs from "fs";
import path from "path";
import log4js from "log4js";
import { default as log4jsConfiguration } from "common/utils/logging";

const version = app.getVersion();
export const userDataPath = app.getPath("userData"); // config file and application data directory

const logFilename = path.join(userDataPath, "latest.log");

try {
  fs.writeFileSync(logFilename, "");
} catch {}

// configure log4js
log4js.configure(log4jsConfiguration(logFilename));

ipcMain.on("get-user-data-path", (ev) => {
  ev.returnValue = userDataPath;
});

ipcMain.on("get-version", (ev) => {
  ev.returnValue = version;
});

ipcMain.handle("open-directory", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!files.canceled) {
    return files.filePaths[0];
  } else return undefined;
});

ipcMain.handle("import-mod", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ extensions: ["jar", "litemod", "zip"], name: "Minecraft Mod" }],
  });
  if (!files.canceled) {
    return files.filePaths[0];
  } else return undefined;
});

ipcMain.on("get-java-home", (ev) => {
  ev.returnValue = process.env.JAVA_HOME;
});

ipcMain.on("quit", () => {
  app.quit();
});

// global main-process logger
export const mainLogger = log4js.getLogger("main");

export const platform = os.platform();
export const arch = os.arch();
export const release = os.release();

// output basic information
mainLogger.info(`*** Epherome ${version} ***`);
mainLogger.info(`Epherome  Copyright (C) 2021  ResetPower`);
mainLogger.info(`Epherome is running on ${process.env.NODE_ENV} mode`);
mainLogger.info(`Operating System: ${platform} ${arch} ${release}`);
mainLogger.info(`Node.js Version: ${process.versions.node}`);
mainLogger.info(`V8 Version: ${process.versions.v8}`);
mainLogger.info(`Chrome Version: ${process.versions.chrome}`);
mainLogger.info(`Electron Version: ${process.versions.electron}`);
mainLogger.info(`Epherome Directory: '${userDataPath}'`);