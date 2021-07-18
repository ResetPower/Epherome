import fs from "fs";
import os from "os";
import path from "path";
import { ipcRenderer } from "electron";
import { MinecraftProfile } from "../struct/profiles";
import { MinecraftAccount } from "../struct/accounts";
import { DefaultFunction } from "../tools/types";

// crucial information from main process
export const constraints = ipcRenderer.sendSync("initialize");

export type EphDownloadProvider = "official" | "bmclapi" | "mcbbs";

export interface EphConfig {
  accounts: MinecraftAccount[];
  profiles: MinecraftProfile[];
  selectedAccount: number;
  selectedProfile: number;
  javaPath: string;
  theme: string;
  themeFollowOs: boolean;
  language: string;
  hitokoto: boolean;
  downloadProvider: EphDownloadProvider;
}

// default values of config
let initConfig: EphConfig = {
  accounts: <MinecraftAccount[]>[],
  profiles: <MinecraftProfile[]>[],
  selectedAccount: 0,
  selectedProfile: 0,
  javaPath: "java",
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
  initConfig = Object.assign(initConfig, obj);
} catch {
  // file does not exist
  fs.writeFileSync(cfgPath, "{}");
}

export const ephConfigs: EphConfig = initConfig;

// create minecraft download path

export const mcDownloadPath = path.join(
  constraints.dir,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);

try {
  fs.accessSync(mcDownloadPath);
} catch {
  // file does not exist
  fs.mkdirSync(mcDownloadPath);
}

// write config to disk
export function saveConfig(): void {
  fs.writeFileSync(cfgPath, JSON.stringify(ephConfigs));
}

// change config and save
export function setConfig(cb: DefaultFunction, save = true): void {
  cb();
  save && saveConfig();
}
