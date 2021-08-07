import fs from "fs";
import got from "got";
import path from "path";
import { DefaultFn, unwrapFunction } from "../tools";

export function createDirIfNotExist(p: string): void {
  try {
    fs.accessSync(p);
  } catch {
    fs.mkdirSync(p, { recursive: true });
  }
}

// create a folder which the file is in
export function createDirByPath(p: string): void {
  createDirIfNotExist(path.dirname(p));
}

export function downloadFile(
  url: string,
  target: string,
  onError?: DefaultFn
): Promise<void> {
  return new Promise((resolve) => {
    createDirByPath(target);
    const downloadStream = got.stream(url);
    const fileStream = fs.createWriteStream(target);
    downloadStream.on("error", unwrapFunction(onError));
    fileStream.on("error", unwrapFunction(onError)).on("finish", resolve);
    downloadStream.pipe(fileStream);
  });
}
