import { spawn } from "child_process";
import findJavaHome from "find-java-home";
import path from "path";
import { ephConfigs, setConfig } from "../renderer/config";

export interface Java {
  dir: string;
  name: string;
  is64Bit: boolean;
}

export function checkJavaVersion(dir: string): Promise<Java | null> {
  return new Promise((resolve) => {
    try {
      const proc = spawn(dir, ["-version"]);
      proc.on("error", () => resolve(null));
      proc.stderr.on("data", (data) => {
        const name = data
          .toString()
          .match(/"(.*?)"/)
          ?.pop();
        if (name) {
          resolve({
            dir,
            name,
            is64Bit: data.includes("64-Bit"),
          });
        } else {
          resolve(null);
        }
      });
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
  setConfig(() => ephConfigs.javas.push(java));
}

export function removeJava(id: number): void {
  setConfig(() => ephConfigs.javas.splice(id, 1));
}
