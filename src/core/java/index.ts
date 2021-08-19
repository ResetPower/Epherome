import { spawnSync } from "child_process";
import { findJavaHome } from "./finder";
import { nanoid } from "nanoid";
import path from "path";
import { Java } from "common/struct/java";

export function parseJvmArgs(args: string): string[] {
  const arr: string[] = [];
  let inQuote = false;
  let temp = "";
  for (const c of `${args} `) {
    if (c === " " && !inQuote) {
      arr.push(temp);
      temp = "";
    } else if (c === '"') {
      inQuote = !inQuote;
    } else {
      temp += c;
    }
  }
  return arr;
}

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

export async function detectJava(): Promise<Java[]> {
  const javas = await findJavaHome();
  const arr: Java[] = [];
  for (const i of javas) {
    const java = await checkJavaVersion(path.join(i, "bin/java"));
    java && arr.push(java);
  }
  return arr;
}
