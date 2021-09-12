import fs from "fs";
import os from "os";
import path from "path";
import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { Java } from "./java";
import { extendObservable, observable, runInAction, toJS } from "mobx";
import { MinecraftDownloadProvider } from "core/down/url";
import { ipcRenderer } from "electron";
import log4js from "log4js";
import log4jsConfiguration from "common/utils/logging";
import { commonLogger } from "common/loggers";
import { _ } from "common/utils/arrays";

export type TitleBarStyle = "os" | "eph";

export const userDataPath = ipcRenderer.sendSync("get-user-data-path");
export const ephCodeName = ipcRenderer.sendSync("get-code-name");

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

// create files
export const minecraftDownloadPath = path.join(
  userDataPath,
  os.platform() === "win32" ? ".minecraft" : "minecraft"
);
export const ephExtPath = path.join(userDataPath, "ext");
export const ephLogExportsPath = path.join(userDataPath, "logs");

!fs.existsSync(minecraftDownloadPath) && fs.mkdirSync(minecraftDownloadPath);
!fs.existsSync(ephExtPath) && fs.mkdirSync(ephExtPath);
!fs.existsSync(ephLogExportsPath) && fs.mkdirSync(ephLogExportsPath);

const { configPath, parsed } = ipcRenderer.sendSync("get-config");

// read config

export class ConfigStore {
  @observable accounts: MinecraftAccount[] = [];
  @observable profiles: MinecraftProfile[] = [];
  @observable javas: Java[] = [];
  @observable theme = "light";
  @observable themeFollowOs = false;
  @observable language = getSystemPreferredLanguage();
  @observable news = false;
  @observable hitokoto = false;
  @observable downloadProvider: MinecraftDownloadProvider = "official";
  @observable downloadConcurrency = 7;
  @observable developerMode = false;
  @observable titleBarStyle: TitleBarStyle = "os";
  constructor(preferred: Partial<unknown>) {
    extendObservable(this, preferred);
  }
  setConfig = (cb: (store: ConfigStore) => unknown, save = true): void => {
    runInAction(() => cb(this));
    save && this.save();
  };
  save(): void {
    commonLogger.info("Saving config");
    fs.writeFileSync(configPath, JSON.stringify(toJS(this)));
  }
}

export const configStore = new ConfigStore(parsed);

export const setConfig = configStore.setConfig;
