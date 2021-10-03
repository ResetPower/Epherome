import fs from "fs";
import path from "path";
import crypto from "crypto";
import { adapt, DefaultFn, ErrorHandler } from ".";
import { MutableRefObject } from "react";
import { shell } from "electron";
import { shortid } from "./ids";
import { Counter, ObjectWrapper } from "./object";
import { DownloaderDetailsListener } from "core/down/downloader";

export interface ParallelDownloadItem {
  unique: number;
  url: string;
  target: string;
}

export type ParallelDownloadItemWithoutUnique = Omit<
  ParallelDownloadItem,
  "unique"
>;

export function ensureDir(p: string): void {
  try {
    fs.accessSync(p);
  } catch {
    fs.mkdirSync(p, { recursive: true });
  }
}

// create a folder which the file is in
export function createDirByPath(p: string): void {
  ensureDir(path.dirname(p));
}

export function downloadFile(
  url: string,
  target: string,
  cancellerWrapper?: MutableRefObject<DefaultFn | undefined>
): Promise<void> {
  const id = shortid();
  return new Promise((resolve, reject) => {
    cancellerWrapper &&
      (cancellerWrapper.current = () => window.native.task.cancel(id));
    window.native.downloadFile(
      url,
      target,
      (err) => (err ? reject(err) : resolve()),
      id,
      false,
      true
    );
  });
}

export async function parallelDownload(
  itemList: ParallelDownloadItemWithoutUnique[],
  onDetailsChange: DownloaderDetailsListener,
  onError: ErrorHandler,
  concurrency: number,
  cancellerWrapper?: MutableRefObject<DefaultFn | undefined>
): Promise<void> {
  const id = shortid();
  const counter = new Counter();
  const items = itemList.map((i) => ({ ...i, unique: counter.count() }));
  const details = items.map((i) => ({
    ...i,
    filename: path.basename(i.target),
    percentage: 0,
    inProgress: false,
  }));
  return new Promise((resolve) => {
    window.exchange.listen(`parallel-download-${id}-err`, (msg) =>
      onError(new Error(msg))
    );
    window.exchange.listen(`parallel-download-${id}-done`, () => {
      resolve();
    });
    window.exchange.listen(`parallel-download-${id}-progress`, (arg) => {
      const [unique, progress] = arg.split("-");
      const [uInt, pInt] = [+unique, +progress];
      const detail = details.find((i) => i.unique === uInt);
      if (detail) {
        if (pInt === 100) {
          detail.inProgress = false;
        } else if (pInt >= 0) {
          detail.inProgress = true;
        }
        detail.percentage = pInt;
      }
      onDetailsChange(
        new ObjectWrapper(details),
        Math.floor(
          details.map((i) => i.percentage).reduce((a, b) => a + b) /
            details.length
        )
      );
    });
    window.native.parallelDownload(items, concurrency, id);
    cancellerWrapper &&
      (cancellerWrapper.current = () => window.native.task.cancel(id));
  });
}

export function calculateHash(file: string, type: "sha1"): string {
  const data = fs.readFileSync(file);
  return crypto.createHash(type).update(data).digest("hex");
}

export type DirFileType = "folder" | "file" | "zip" | "modFile";

export function readdir(filepath: string, ...type: DirFileType[]): string[] {
  const act = (file: string, type: DirFileType): boolean => {
    const stat = fs.lstatSync(file);
    if (type === "folder") return stat.isDirectory();
    if (type === "file") return stat.isFile();
    if (type === "zip") return stat.isFile() && path.extname(file) === ".zip";
    if (type === "modFile")
      return (
        stat.isFile() &&
        adapt(path.extname(file), ".jar", ".litemod", ".zip", ".disabled")
      );
    return false;
  };
  try {
    return fs.readdirSync(filepath).filter((val) => {
      if (val === ".DS_Store") return false;
      for (const i of type) {
        if (act(path.join(filepath, val), i)) return true;
      }
      return false;
    });
  } catch {
    return [];
  }
}

export async function moveToTrash(filepath: string): Promise<void> {
  return shell.trashItem(filepath);
}

export function basenameWithoutExt(filepath: string): string {
  const filename = path.basename(filepath);
  if (filename.indexOf(".") === -1) return filename;
  if (filepath.endsWith(".disabled")) {
    return basenameWithoutExt(filepath.slice(0, -9));
  }
  return filename.split(".").slice(0, -1).join(".");
}
