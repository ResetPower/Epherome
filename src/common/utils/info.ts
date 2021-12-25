import { ipcRenderer } from "electron";
import path from "path";
import os from "os";

export const {
  userDataPath,
  codeName,
  version: ephVersion,
  configPath,
  parsed: parsedConfig,
} = ipcRenderer.sendSync("get-info");

export const ephDefaultDotMinecraft = path.join(
  userDataPath,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);
export const ephLogs = path.join(userDataPath, "logs");
export const ephLatestLog = path.join(userDataPath, "latest.log");
