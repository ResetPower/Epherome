import { EphExtension } from "common/extension";
import { userDataPath } from "common/utils/info";
import path from "path";
import fs from "fs";

export type EphExtStat =
  | "installed" // installed and loaded
  | "reloadRequiredToIn" // installed but not loaded
  | "reloadRequiredToUn" // uninstalled but loaded
  | "notInstalled"; // not installed and not loaded

export class ExtensionStore {
  extensions: EphExtension[] = [];
  imported: EphExtension[] = [];
  load(extensions: EphExtension[]) {
    this.extensions = extensions;
  }
  import(ext: EphExtension) {
    this.imported.push(ext);
  }
  find(id: string): boolean {
    for (const i of this.extensions) {
      if (i.id === id) {
        return true;
      }
    }
    return false;
  }
  stat(id: string): EphExtStat {
    const dir = path.join(userDataPath, "ext", id);
    if (fs.existsSync(dir)) {
      return this.find(id) ? "installed" : "reloadRequiredToIn";
    } else {
      return this.find(id) ? "reloadRequiredToUn" : "notInstalled";
    }
  }
}

export const extensionStore = new ExtensionStore();
