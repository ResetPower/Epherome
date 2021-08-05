import fs from "fs";
import got from "got";
import path from "path";
import { DefaultFn, unwrapFunction } from "../../tools";

export type DownloadProgressListener = (event: {
  transferred: number;
  total: number;
  percent: number;
}) => void;

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

export function* cancellableDownloadFile(
  url: string,
  target: string,
  onProgress?: DownloadProgressListener,
  onError?: DefaultFn
): Generator {
  createDirByPath(target);
  const downloadStream = got.stream(url);
  const fileStream = fs.createWriteStream(target);
  if (onProgress) {
    downloadStream
      .on("downloadProgress", onProgress)
      .on("error", unwrapFunction(onError));
  }
  yield () => {
    downloadStream.destroy();
    fileStream.destroy();
  };
  yield new Promise((resolve) => {
    fileStream.on("error", unwrapFunction(onError)).on("finish", resolve);
    downloadStream.pipe(fileStream);
  });
}

export function downloadFile(
  url: string,
  target: string,
  onProgress?: DownloadProgressListener,
  onError?: DefaultFn
): Promise<void> {
  return new Promise((resolve) => {
    createDirByPath(target);
    const downloadStream = got.stream(url);
    const fileStream = fs.createWriteStream(target);
    if (onProgress) {
      downloadStream
        .on("downloadProgress", onProgress)
        .on("error", unwrapFunction(onError));
    }
    fileStream.on("error", unwrapFunction(onError)).on("finish", resolve);
    downloadStream.pipe(fileStream);
  });
}
