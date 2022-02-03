import { Bridge } from "common/bridge";
import type { EphExtension, EphExtensionMeta } from "common/extension";
import type { EphSubscriptionMap } from "common/stores/extension";
import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { createContext, runInContext } from "vm";
import { mainLogger } from "./system";

function loadExtension(ext: EphExtension): Bridge | null {
  const bridge = new Bridge(ext.meta);
  const vm = createContext({
    bridge,
  });
  try {
    runInContext(ext.runnable, vm);
    return bridge;
  } catch (error) {
    mainLogger.error(
      `Error occurred loading extension@${ext.id}\n  Caused by: \n${error}`
    );
    return null;
  }
}

ipcMain.handle("load-extensions", async (_, extPath: string) => {
  const extensions: EphExtension[] = [];
  const files = fs.readdirSync(extPath);
  const map: EphSubscriptionMap = {};
  for (const file of files) {
    const ext = path.join(extPath, file);
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
        const extObj: EphExtension = { id: file, meta, runnable };
        const bridge = loadExtension(extObj);
        bridge?.subscriptions.forEach((s) => {
          if (map[s.id]) {
            map[s.id].push(s);
          } else {
            map[s.id] = [s];
          }
        });
        extensions.push(extObj);
      }
    }
  }
  return [extensions, map];
});
