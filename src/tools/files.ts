import fs from "fs";

export function mkdirByFile(path: string): void {
  const arr = path.split("/");
  arr.pop();
  fs.mkdirSync(arr.join("/"), { recursive: true });
}
