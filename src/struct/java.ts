import { spawn } from "child_process";
import findJavaHome from "find-java-home";
import path from "path";
import { ephConfigs, setConfig } from "../renderer/config";
import { getNextId, WithId } from "../tools";

export interface Java extends WithId {
  dir: string;
  name: string;
  is64Bit: boolean;
}

export type JavaWithoutId = Omit<Java, "id">;

export function checkJavaVersion(dir: string): Promise<JavaWithoutId | null> {
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

export function detectJava(): Promise<JavaWithoutId | null> {
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

export function createJava(java: JavaWithoutId): void {
  setConfig(() => ephConfigs.javas.push({ id: getNextId(ephConfigs.javas), ...java }));
}

export function removeJava(id: number): void {
  setConfig({ javas: ephConfigs.javas.filter((value) => value.id !== id) });
}
