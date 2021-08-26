import fs from "fs";
import path from "path";
import { createContext, runInContext } from "vm";
import { nanoid } from "nanoid";
import { mainLogger } from "../system";
import { ipcMain } from "electron";
import { EphExtension, EphExtensionMeta } from "common/stores/extension";
import { Bridge } from "./bridge";
import extSquare from "common/ext-square";

function loadExtension(ext: EphExtension): boolean {
  const vm = createContext({
    bridge: new Bridge(ext),
  });
  try {
    runInContext(ext.runnable, vm);
    return true;
  } catch (error) {
    mainLogger.error(
      `Error occurred loading extension@${ext.id}\n  Caused by: \n${error}`
    );
    return false;
  }
}

ipcMain.handle("load-ext", async (_, extPath: string) => {
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
        loadExtension(extObj) && extensions.push(extObj);
      }
    }
  }
  loadExtension(extSquare) && extensions.push(extSquare);
  return extensions;
});
