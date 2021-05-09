import fs from "fs";
import path from "path";
import json5 from "json5";
import { ipcRenderer } from "electron";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";

export const constraints = ipcRenderer.sendSync("initialize");

export interface Config {
  accounts: MinecraftAccount[];
  profiles: MinecraftProfile[];
  selectedAccount: number;
  selectedProfile: number;
  javaPath: string;
  theme: string;
}

export let epheromeConfigs: Config = {
  accounts: <MinecraftAccount[]>[],
  profiles: <MinecraftProfile[]>[],
  selectedAccount: 0,
  selectedProfile: 0,
  javaPath: "java",
  theme: "light",
};

const ud = constraints.dir;
const cfg = ud + path.sep + "config.json5";

try {
  fs.accessSync(cfg);
  // file does exist
  const str = fs.readFileSync(cfg).toString();
  epheromeConfigs = json5.parse(str);
} catch {
  // file does not exist
  fs.writeFileSync(cfg, "{}");
}

// write config to disk
export function saveConfig(): void {
  fs.writeFileSync(cfg, json5.stringify(epheromeConfigs));
}

// read config from memory
export function readConfig<T>(key: string, def: T): T {
  const ret = (epheromeConfigs as any)[key];
  return ret === undefined ? def : (ret as T);
}

export function writeConfig<T>(key: string, value: T, save = false): void {
  (epheromeConfigs as any)[key] = value;
  save && saveConfig();
}
