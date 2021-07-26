import fs from "fs";
import os from "os";
import path from "path";
import { ipcRenderer } from "electron";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { DefaultFunction } from "../tools/types";
import { detectJava, Java } from "./java";

// crucial information from main process
export const constraints = ipcRenderer.sendSync("initialize");

export type EphDownloadProvider = "official" | "bmclapi" | "mcbbs";

export interface EphConfig {
  accounts: MinecraftAccount[];
  profiles: MinecraftProfile[];
  javas: Java[];
  selectedAccount: number;
  selectedProfile: number;
  selectedJava: number;
  theme: string;
  themeFollowOs: boolean;
  language: string;
  hitokoto: boolean;
  downloadProvider: EphDownloadProvider;
}

// default values of config
const initConfig: EphConfig = {
  accounts: [],
  profiles: [],
  javas: [],
  selectedAccount: 0,
  selectedProfile: 0,
  selectedJava: 0,
  theme: "light",
  themeFollowOs: false,
  hitokoto: true,
  // if no language found in config, follow the system
  language: navigator.language.startsWith("zh") ? "zh-cn" : "en-us",
  downloadProvider: "official",
};

// prepare config
export const cfgPath = path.join(constraints.dir, "settings.json");

try {
  fs.accessSync(cfgPath);
  // file does exist
  const str = fs.readFileSync(cfgPath).toString();
  const obj = JSON.parse(str);
  Object.assign(initConfig, obj);
} catch {
  // file does not exist
  fs.writeFileSync(cfgPath, "{}");
}

// initialize java config
if (initConfig.javas.length === 0) {
  detectJava().then((java) => {
    java && initConfig.javas.push(java);
  });
}

export const ephConfigs: EphConfig = initConfig;

// create directories

export const mcDownloadPath = path.join(
  constraints.dir,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);

export const ephExtensionsPath = path.join(constraints.dir, "extensions");

!fs.existsSync(mcDownloadPath) && fs.mkdirSync(mcDownloadPath);
!fs.existsSync(ephExtensionsPath) && fs.mkdirSync(ephExtensionsPath);

// write config to disk
export function saveConfig(): void {
  fs.writeFileSync(cfgPath, JSON.stringify(ephConfigs));
}

// change config and save
export function setConfig(cb: ((cfg: EphConfig) => unknown) | Partial<EphConfig>): void {
  if (cb instanceof Function) {
    cb(ephConfigs);
  } else {
    Object.assign(ephConfigs, cb);
  }
  saveConfig();
}
