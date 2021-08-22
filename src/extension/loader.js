const fs = require("fs");
const path = require("path");
const { createContext, runInContext } = require("vm");
const { ExtensionBridge } = require("./bridge");
const { nanoid } = require("nanoid");
const { userDataPath } = require("../system");
const { ipcMain } = require("electron");

const extPath = path.join(userDataPath, "ext");

function loadExtension(ext) {
  const vm = createContext({
    bridge: ExtensionBridge,
  });
  try {
    runInContext(ext.runnable, vm);
    return true;
  } catch {
    return false;
  }
}

function findProperties(properties, key) {
  for (const p of properties) {
    if (p[0] === key) {
      return p[1];
    }
  }
  return undefined;
}

ipcMain.handle("load-ext", async () => {
  const extensions = [];
  const files = fs.readdirSync(extPath);
  for (const i of files) {
    const ext = path.join(extPath, i);
    const stat = fs.lstatSync(ext);
    if (!stat.isFile()) {
      continue;
    }
    const data = fs.readFileSync(ext).toString();
    const split = data.split("\n").slice(0, 3);
    const properties = split.map((i) => {
      if (i.startsWith("// ")) {
        const j = i.slice(3);
        const split = j.split(" ");
        return [split[0], split.slice(1).join(" ")];
      }
      return ["", ""];
    });
    if (properties[0].toString() === ["@eph.magic", "frankbabe"].toString()) {
      const meta = findProperties(properties, "@eph.meta");
      if (meta) {
        const ext = {
          id: nanoid(),
          meta: JSON.parse(meta),
          runnable: data,
        };
        loadExtension(ext) && extensions.push(ext);
      }
    }
  }
  return extensions;
});
