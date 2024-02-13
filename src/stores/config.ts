import {
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { MinecraftAccount, MinecraftInstance } from "./struct";
import { List } from "./list";
import { MinecraftDownloadProvider } from "../core/url";
import { meta } from ".";

const configStore = {
  downloadProvider: "official" as MinecraftDownloadProvider,
  language: "en-ww",
  accounts: new List<MinecraftAccount>(),
  instances: new List<MinecraftInstance>(),
  async load() {
    if (await exists(meta.configFile)) {
      const data = JSON.parse(await readTextFile(meta.configFile));
      Object.assign(configStore, data);
      // note that stringifying objects in javascript
      // does not copy methods in it,
      // which destroys the functionality of lists,
      // so we need to load lists manually
      this.accounts = List.from(this.accounts);
      this.instances = List.from(this.instances);
    } else {
      // create the directory if not exist
      await createDir(meta.appDataDir);
    }
  },
  async save() {
    await writeTextFile(meta.configFile, JSON.stringify(this));
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
