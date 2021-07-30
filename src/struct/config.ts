import fs from "fs";
import os from "os";
import path from "path";
import { ipcRenderer } from "electron";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { detectJava, Java } from "./java";
import { SelectableArray } from "../tools/arrays";
import { createContext } from "react";
import { initRequiredFunction } from "../tools";

// crucial information from main process
export const constraints = ipcRenderer.sendSync("initialize");

export type EphDownloadProvider = "official" | "bmclapi" | "mcbbs";

export interface EphConfig {
  accounts: SelectableArray<MinecraftAccount>;
  profiles: SelectableArray<MinecraftProfile>;
  javas: SelectableArray<Java>;
  theme: string;
  themeFollowOs: boolean;
  language: string;
  hitokoto: boolean;
  downloadProvider: EphDownloadProvider;
}

export type EphConfigSetter = (
  cb: Partial<EphConfig> | ((prev: EphConfig) => /*Partial<EphConfig>*/ unknown)
) => unknown;

let parsed: Partial<EphConfig> = {};

// prepare config
export const cfgPath = path.join(constraints.dir, "settings.json");

try {
  fs.accessSync(cfgPath);
  // file does exist
  const str = fs.readFileSync(cfgPath).toString();
  parsed = JSON.parse(str);
} catch {
  // file does not exist
  fs.writeFileSync(cfgPath, "{}");
}

// default values of config
export const ephConfigs: EphConfig = {
  accounts: SelectableArray.create(parsed.accounts),
  profiles: SelectableArray.create(parsed.profiles),
  javas: SelectableArray.create(parsed.javas),
  theme: parsed.theme ?? "light",
  themeFollowOs: parsed.themeFollowOs ?? false,
  hitokoto: parsed.hitokoto ?? true,
  // if no language found in config, follow the system
  language:
    parsed.language ??
    (navigator.language.startsWith("zh") ? "zh-cn" : "en-us"),
  downloadProvider: parsed.downloadProvider ?? "official",
};

// initialize java config
if (ephConfigs.javas.length === 0) {
  detectJava().then((java) => {
    java && ephConfigs.javas.push(java);
  });
}

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
export const setConfig: EphConfigSetter = (cb) => {
  if (cb instanceof Function) {
    cb(ephConfigs);
  } else {
    Object.assign(ephConfigs, cb);
  }
  saveConfig();
};
