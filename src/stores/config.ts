import {
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { MinecraftAccount, MinecraftProfile } from "./struct";
import { List } from "./list";

// acquire basic information
export const dataDir = await appDataDir();
const configFile = await resolve(dataDir, "config.json");
// create the directory if not exist
if (!(await exists(dataDir))) {
  createDir(dataDir);
}

const configStore = {
  accounts: new List<MinecraftAccount>(),
  profiles: new List<MinecraftProfile>(),
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
};
export const cfg = new Proxy(configStore, {
  set(target, p, newValue, receiver) {
    Reflect.set(target, p, newValue, receiver);
    // auto save on every set action
    configStore.save();
    return true;
  },
});

// load existing config
configStore.load();
