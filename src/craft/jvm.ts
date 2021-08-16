import { spawnSync } from "child_process";
import findJavaHome from "find-java-home";
import { nanoid } from "nanoid";
import path from "path";
import { Java } from "../struct/java";

export function defaultJvmArgs(): string {
  return "-Xmx2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M";
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
            nanoid: nanoid(),
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
  return new Promise((resolve, reject) =>
    findJavaHome((err, res) => {
      if (err) {
        resolve(null);
      } else {
        checkJavaVersion(path.join(res, "bin", "java"))
          .then(resolve)
          .catch(reject);
      }
    })
  );
}
