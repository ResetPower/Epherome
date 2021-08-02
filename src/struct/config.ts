import fs from "fs";
import os from "os";
import path from "path";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { detectJava, Java } from "./java";
import { extendObservable, observable, runInAction, toJS } from "mobx";
import { MinecraftDownloadProvider } from "../core/net";
import { ipcRenderer } from "electron";

export const userDataPath = ipcRenderer.sendSync("getUserDataPath");

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
export const cfgPath = path.join(userDataPath, "settings.json");
export const mcDownloadPath = path.join(
  userDataPath,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);
export const ephExtensionsPath = path.join(userDataPath, "extensions");

!fs.existsSync(cfgPath) && fs.writeFileSync(cfgPath, "{}");
!fs.existsSync(mcDownloadPath) && fs.mkdirSync(mcDownloadPath);
!fs.existsSync(ephExtensionsPath) && fs.mkdirSync(ephExtensionsPath);

// read config

const parsed = JSON.parse(fs.readFileSync(cfgPath).toString());

export class ConfigStore {
  @observable accounts: MinecraftAccount[] = [];
  @observable profiles: MinecraftProfile[] = [];
  @observable javas: Java[] = [];
  @observable theme = "light";
  @observable themeFollowOs = false;
  @observable language = navigator.language.startsWith("zh")
    ? "zh-cn"
    : "en-us";
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
    fs.writeFileSync(cfgPath, JSON.stringify(toJS(this)));
  }
}

export const configStore = new ConfigStore(parsed);

export const setConfig = configStore.setConfig;
