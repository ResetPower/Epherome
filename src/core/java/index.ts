import path from "path";
import fs from "fs";

const javaFilename = process.platform === "win32" ? "java.exe" : "java";

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

export function parseJavaExecutablePath(source: string): string {
  if (path.basename(source) === javaFilename) {
    return source;
  }
  for (const p of ["", "bin", "Home/bin", "Contents/Home/bin"]) {
    const exe = path.join(source, p, javaFilename);
    if (
      fs.existsSync(exe) &&
      fs.lstatSync(exe).isFile() &&
      path.basename(exe) === javaFilename
    ) {
      return exe;
    }
  }
  return source;
}
