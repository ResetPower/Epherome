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
