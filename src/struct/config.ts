import fs from "fs";
import os from "os";
import path from "path";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { detectJava, Java } from "./java";
import { extendObservable, observable, runInAction, toJS } from "mobx";
import { MinecraftDownloadProvider } from "../craft/download";
import { ipcRenderer } from "electron";
import { logger } from "../renderer/global";
import log4js from "log4js";
import log4jsConfiguration from "../tools/logging";

export const userDataPath = ipcRenderer.sendSync("get-user-data-path");

export const logFilename = path.join(userDataPath, "latest.log");

// configure log4js
log4js.configure(log4jsConfiguration(logFilename));

export function getSystemPreferredLanguage(): string {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) {
    return "zh-cn";
  } else if (lang.startsWith("ja")) {
    return "ja-jp";
  } else {
    return "en-us";
  }
}

export interface EphConfig {
  accounts: MinecraftAccount[];
  profiles: MinecraftProfile[];
  javas: Java[];
  theme: string;
  themeFollowOs: boolean;
  language: string;
  hitokoto: boolean;
  downloadProvider: MinecraftDownloadProvider;
}

// create files
export const configFilename = path.join(userDataPath, "settings.json");
export const minecraftDownloadPath = path.join(
  userDataPath,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);
export const ephExtensionsPath = path.join(userDataPath, "extensions");

!fs.existsSync(configFilename) && fs.writeFileSync(configFilename, "{}");
!fs.existsSync(minecraftDownloadPath) && fs.mkdirSync(minecraftDownloadPath);
!fs.existsSync(ephExtensionsPath) && fs.mkdirSync(ephExtensionsPath);

// read config

const parsed = JSON.parse(fs.readFileSync(configFilename).toString());

export class ConfigStore {
  @observable accounts: MinecraftAccount[] = [];
  @observable profiles: MinecraftProfile[] = [];
  @observable javas: Java[] = [];
  @observable theme = "light";
  @observable themeFollowOs = false;
  @observable language = getSystemPreferredLanguage();
  @observable hitokoto = false;
  @observable downloadProvider: MinecraftDownloadProvider = "official";
  constructor(preferred: Partial<EphConfig>) {
    extendObservable(this, preferred);
    // initialize java config
    if (this.javas.length === 0) {
      detectJava().then((java) => {
        java && this.javas.push(java);
      });
    }
  }
  setConfig = (cb: (store: ConfigStore) => unknown): void => {
    runInAction(() => cb(this));
    this.save();
  };
  save(): void {
    logger.info("Saving config");
    fs.writeFileSync(configFilename, JSON.stringify(toJS(this)));
  }
}

export const configStore = new ConfigStore(parsed);

export const setConfig = configStore.setConfig;
