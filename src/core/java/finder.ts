import fs from "fs";
import path from "path";
import which from "which";
import WinReg, { Registry } from "winreg";
import { ipcRenderer } from "electron";

const plat = process.platform;
const isNTKernel = plat === "win32";
// Note that this file is required by mocha test, so ipcRenderer is possibly be undefined
const JAVA_HOME = ipcRenderer?.sendSync("get-java-home");
const javaFilename = "java" + (isNTKernel ? ".exe" : "");
const javaRegistryKeyPaths = [
  "\\SOFTWARE\\JavaSoft\\JDK",
  "\\SOFTWARE\\JavaSoft\\Java Development Kit",
  "\\SOFTWARE\\JavaSoft\\Java Runtime Environment",
];
const javaDefaultPaths = {
  darwin: ["/Library/Java/JavaVirtualMachines"],
  win32: ["C:\\Program Files\\Java\\", "C:\\Program Files (x86)\\Java"],
  linux: ["/usr/lib/jvm"],
};

export type RegArch = "x64" | "x86";
export const regArches: RegArch[] = ["x64", "x86"];

export async function findJavaHome(): Promise<string[]> {
  const javas: string[] = [];
  // From JAVA_HOME
  if (JAVA_HOME && dirIsJavaHome(JAVA_HOME)) {
    javas.push(path.join(JAVA_HOME, "bin", javaFilename));
  }
  // From PATH
  const fromPath = await findInPath();
  fromPath && javas.push(fromPath);
  // From Registry (NT Kernel Only)
  if (isNTKernel) {
    const fromReg = await findInRegistry(javaRegistryKeyPaths);
    fromReg && javas.push(...fromReg);
  }
  // From Default Install Paths
  const fromDefaultPaths = findInPaths(
    javaDefaultPaths[plat as keyof typeof javaDefaultPaths] ?? [],
    plat === "darwin"
  );
  javas.push(...fromDefaultPaths);
  return Array.from(new Set(javas));
}

function findInPath() {
  return new Promise<string | null>((resolve) => {
    which(javaFilename, (err, path) => {
      if (err || !path) {
        return resolve(null);
      }
      // resolve symlinks
      path = fs.realpathSync(path);
      resolve(path);
    });
  });
}

async function findInRegistry(keyPaths: string[]): Promise<string[]> {
  const javas: string[] = [];
  if (!keyPaths.length) return javas;
  const promises = [];
  for (const arch of regArches) {
    for (const keyPath of keyPaths) {
      promises.push(findPossibleRegKey(keyPath, arch));
    }
  }
  const keysFoundSegments: Registry[][] = await Promise.all(promises);
  const keysFound: Registry[] = Array.prototype.concat.apply(
    [],
    keysFoundSegments
  );
  if (!keysFound.length) return javas;
  const sortedKeysFound = keysFound.sort(function (a, b) {
    const aVer = parseFloat(a.key);
    const bVer = parseFloat(b.key);
    return bVer - aVer;
  });
  for (const key of sortedKeysFound) {
    const res = await findInRegKey(key);
    res && javas.push(res);
  }
  return javas;
}

function findPossibleRegKey(
  keyPath: string,
  regArch: RegArch
): Promise<Registry[]> {
  return new Promise<Registry[]>((resolve) => {
    const winreg: Registry = new WinReg({
      hive: WinReg.HKLM,
      key: keyPath,
      arch: regArch,
    });
    winreg.keys((err, result) => {
      if (err) {
        return resolve([]);
      }
      resolve(result);
    });
  });
}

function findInRegKey(reg: Registry): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    reg.get("JavaHome", (err, home) => {
      if (err || !home) {
        return resolve(null);
      }
      resolve(home.value);
    });
  });
}

function findInPaths(paths: string[], withContentsHome = false): string[] {
  const javas: string[] = [];
  for (const p of paths) {
    try {
      const files = fs.readdirSync(p);
      files.forEach((f) => {
        const dir = path.join(p, f);
        if (dirIsJavaHome(dir)) {
          javas.push(dir);
        } else if (withContentsHome) {
          const dir = path.join(p, f, "Contents/Home");
          dirIsJavaHome(dir) && javas.push(path.join(dir, "bin", javaFilename));
        }
      });
    } catch {}
  }
  return javas;
}

function dirIsJavaHome(dir: string): boolean {
  return (
    fs.existsSync(dir) &&
    fs.statSync(dir).isDirectory() &&
    fs.existsSync(path.resolve(dir, "bin", javaFilename))
  );
}
