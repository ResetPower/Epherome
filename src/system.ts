import { ipcMain, dialog, app } from "electron";
import os from "os";
import fs from "fs";
import path from "path";
import log4js from "log4js";
import { default as log4jsConfiguration } from "./common/utils/logging";

// base information
const version = app.getVersion();
const codeName = "Binary Tree";
const userDataPath = app.getPath("userData");

const configPath = path.join(userDataPath, "settings.json");
const logFilename = path.join(userDataPath, "latest.log");

// initialize files
fs.writeFileSync(logFilename, "");
!fs.existsSync(configPath) && fs.writeFileSync(configPath, "{}");

// parse config
export let parsed = readConfig();

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath).toString());
}

// configure log4js
log4js.configure(log4jsConfiguration(logFilename));

ipcMain.on("get-info", (ev) => {
  parsed = readConfig();
  ev.returnValue = {
    userDataPath,
    codeName,
    version,
    configPath,
    parsed,
  };
});

ipcMain.handle("open-directory", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!files.canceled) {
    return files.filePaths[0];
  } else return undefined;
});

ipcMain.handle("open-java", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openDirectory", "openFile"],
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

// global main-process logger
export const mainLogger = log4js.getLogger("main");

const platform = os.platform();
const arch = os.arch();
const release = os.release();

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
