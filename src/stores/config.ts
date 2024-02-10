import {
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { MinecraftAccount, MinecraftProfile } from "./struct";
import { List } from "./list";
import { MinecraftDownloadProvider } from "../core/url";
import { app } from "@tauri-apps/api";

export const appVersion = await app.getVersion();
export const tauriVersion = await app.getTauriVersion();

// acquire basic information
export const dataDir = await appDataDir();
const configFile = await resolve(dataDir, "config.json");
// create the directory if not exist
if (!(await exists(dataDir))) {
  await createDir(dataDir);
}

const configStore = {
  downloadProvider: "official" as MinecraftDownloadProvider,
  accounts: new List<MinecraftAccount>(),
  profiles: new List<MinecraftProfile>(),
  lang: "English",
  async load() {
    if (await exists(configFile)) {
      const data = JSON.parse(await readTextFile(configFile));
      Object.assign(configStore, data);
      // note that stringifying objects in javascript
      // does not copy methods in it,
      // which destroys the functionality of lists,
      // so we need to load lists manually
      this.accounts = List.from(this.accounts);
      this.profiles = List.from(this.profiles);
    }
  },
  async save() {
    await writeTextFile(configFile, JSON.stringify(this));
  },
  saveAsync() {
    this.save().then().catch;
  },
};
export const cfg = new Proxy(configStore, {
  set(target, p, newValue, receiver) {
    Reflect.set(target, p, newValue, receiver);
    // auto save on every set action
    configStore.saveAsync();
    return true;
  },
});

// load existing config
await configStore.load();
