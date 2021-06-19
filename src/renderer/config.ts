import fs from "fs";
import path from "path";
import json5 from "json5";
import { ipcRenderer } from "electron";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";

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
  hitokoto: true,
  // if no language found in config, follow the system
  language: navigator.language.startsWith("zh") ? "zh-cn" : "en-us",
  downloadProvider: "official",
};

// prepare config
const cfg = constraints.dir + path.sep + "config.json5";

try {
  fs.accessSync(cfg);
  // file does exist
  const str = fs.readFileSync(cfg).toString();
  const obj = json5.parse(str);
  initConfig = Object.assign(initConfig, obj);
} catch {
  // file does not exist
  fs.writeFileSync(cfg, "{}");
}

export const ephConfigs: EphConfig = initConfig;

// write config to disk
export function saveConfig(): void {
  fs.writeFileSync(cfg, json5.stringify(ephConfigs));
}

// change config and save
export function setConfig(cb: () => void, save = true): void {
  cb();
  save && saveConfig();
}
