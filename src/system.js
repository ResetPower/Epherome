const { ipcMain, dialog, app } = require("electron");
const os = require("os");
const fs = require("fs");
const path = require("path");
const log4js = require("log4js");
const { default: log4jsConfiguration } = require("common/utils/logging");

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
const mainLogger = log4js.getLogger("main");

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
mainLogger.info(`Epherome Directory: '${dir}'`);

module.exports = { mainLogger, platform, arch, release };
