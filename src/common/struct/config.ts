import { MinecraftProfile } from "./profiles";
import { MinecraftAccount } from "./accounts";
import { Java } from "./java";
import { action, extendObservable, observable, runInAction, toJS } from "mobx";
import { MinecraftDownloadProvider } from "core/url";
import log4js from "log4js";
import log4jsConfiguration from "common/utils/logging";
import { commonLogger } from "common/loggers";
import {
  configPath,
  ephDefaultDotMinecraft,
  ephLatestLog,
  ephLogs,
  parsedConfig,
} from "common/utils/info";
import fs from "fs";
import { ensureDir } from "common/utils/files";
import { RCSTheme } from "@resetpower/rcs";
import { MinecraftServer } from "./server";

export type TitleBarStyle = "os" | "eph";

[ephDefaultDotMinecraft, ephLogs].forEach(ensureDir);

// configure log4js
log4js.configure(log4jsConfiguration(ephLatestLog));

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

export type FnBoardPlacement = "top" | "right" | "off";

export interface Dimension {
  width?: number;
  height?: number;
}

// read config

export class ConfigStore {
  @observable accounts: MinecraftAccount[] = [];
  @observable profiles: MinecraftProfile[] = [];
  @observable servers: MinecraftServer[] = [];
  @observable javas: Java[] = [];
  @observable theme = "RCS Light";
  @observable themeList: RCSTheme[] = [];
  @observable themeFollowOs = true;
  @observable language = getSystemPreferredLanguage();
  @observable news = true;
  @observable hitokoto = false;
  @observable downloadProvider: MinecraftDownloadProvider = "official";
  @observable downloadConcurrency = 7;
  @observable developerMode = false;
  @observable titleBarStyle: TitleBarStyle = "os";
  @observable checkUpdate = true;
  @observable epheromeToken = "";
  @observable enableBg = false;
  @observable bgPath = "";
  @observable fnBoardPlacement: FnBoardPlacement = "top";
  @observable downloadTarget: string = ephDefaultDotMinecraft;
  @observable rememberWindowSize = false;
  @observable windowSize: Dimension = {};
  @observable newsTitleAmount = 2;
  constructor(preferred: Partial<unknown>) {
    const defaultConfig = toJS(this);
    extendObservable(this, { ...defaultConfig, ...preferred });
    ensureDir(this.downloadTarget);
  }
  @action
  setConfig = (cb: (store: ConfigStore) => unknown, save = true): void => {
    runInAction(() => cb(this));
    save && this.save();
  };
  save(): void {
    commonLogger.info("Saving config");
    fs.writeFileSync(configPath, JSON.stringify(toJS(this)));
  }
}

export const configStore = new ConfigStore(parsedConfig);

export const setConfig = configStore.setConfig;
