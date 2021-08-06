import { spawnSync } from "child_process";
import findJavaHome from "find-java-home";
import path from "path";
import { WithUnderline, _ } from "../tools/arrays";
import { setConfig } from "./config";

export interface Java extends WithUnderline {
  dir: string;
  name: string;
  is64Bit: boolean;
}

export function checkJavaVersion(dir: string): Promise<Java | null> {
  return new Promise((resolve) => {
    try {
      const proc = spawnSync(dir, ["-version"]);
      if (proc.error) {
        resolve(null);
      } else {
        const data = proc.stderr.toString();
        const name = data.match(/"(.*?)"/)?.pop();
        if (name) {
          resolve({
            dir,
            name,
            is64Bit: data.toLowerCase().includes("64-bit"),
          });
        } else {
          resolve(null);
        }
      }
    } catch {
      resolve(null);
    }
  });
}

export function detectJava(): Promise<Java | null> {
  return new Promise((resolve) =>
    findJavaHome((err, res) => {
      if (err) {
        resolve(null);
      } else {
        checkJavaVersion(path.join(res, "bin", "java")).then(resolve);
      }
    })
  );
}

export function createJava(java: Java): void {
  setConfig((cfg) => _.append(cfg.javas, java));
}

export function removeJava(java: Java): void {
  setConfig((cfg) => _.remove(cfg.javas, java));
}
