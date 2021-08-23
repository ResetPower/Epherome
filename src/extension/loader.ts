import fs from "fs";
import path from "path";
import { createContext, runInContext } from "vm";
import { nanoid } from "nanoid";
import { userDataPath } from "../system";
import { ipcMain } from "electron";
import { EphExtension, EphExtensionMeta } from "common/stores/extension";

const extPath = path.join(userDataPath, "ext");

function loadExtension(ext: EphExtension) {
  const vm = createContext({});
  try {
    runInContext(ext.runnable, vm);
    return true;
  } catch {
    return false;
  }
}

ipcMain.handle("load-ext", async () => {
  const extensions: EphExtension[] = [];
  const files = fs.readdirSync(extPath);
  for (const i of files) {
    const ext = path.join(extPath, i);
    const stat = fs.lstatSync(ext);
    if (stat.isFile()) {
      continue;
    }
    let runnable: string | undefined = undefined;
    let meta: EphExtensionMeta | undefined = undefined;
    for (const i of fs.readdirSync(ext)) {
      if (i === "main.js") {
        runnable = fs.readFileSync(path.join(ext, "main.js")).toString();
      } else if (i === "ext.json") {
        meta = JSON.parse(
          fs.readFileSync(path.join(ext, "ext.json")).toString()
        );
      }
      if (meta && runnable) {
        const extObj: EphExtension = { id: nanoid(), meta, runnable };
        loadExtension(extObj);
        extensions.push(extObj);
      }
    }
  }
  return extensions;
});
