import fs from "fs";
import got from "got";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

export function createDirByPath(path: string): void {
  const arr = path.split("/");
  arr.pop();
  const newPath = arr.join("/");
  try {
    fs.accessSync(newPath);
  } catch (e) {
    fs.mkdirSync(newPath, { recursive: true });
  }
}

export async function downloadFile(url: string, target: string, recursive = false): Promise<void> {
  if (!recursive) {
    createDirByPath(target);
  }
  await pipelineAsync(got.stream(url), fs.createWriteStream(target));
}
