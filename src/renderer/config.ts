import fs from "fs";
import path from "path";
import json5 from "json5";
import { ipcRenderer } from "electron";

export const constraints = ipcRenderer.sendSync("initialize");

let data: { [key: string]: unknown } = {};
const ud = constraints.dir;
const cfg = ud + path.sep + "config.json5";

try {
  fs.accessSync(cfg);
  // file does exist
  const str = fs.readFileSync(cfg).toString();
  data = json5.parse(str);
} catch {
  // file does not exist
  fs.writeFileSync(cfg, "{}");
}

// write config to disk
export function saveConfig(): void {
  fs.writeFileSync(cfg, json5.stringify(data));
}

// read config from memory
export function readConfig<T>(key: string, def: T): T {
  const ret = data[key];
  return ret === undefined ? def : (ret as T);
}

export function writeConfig<T>(key: string, value: T, save = false): void {
  data[key] = value;
  save && saveConfig();
}
