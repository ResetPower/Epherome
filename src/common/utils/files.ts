import fs, { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";
import { adapt } from "../utils";
import { shell } from "electron";
import { Counter, ObjectWrapper } from "../utils/object";
import got from "got";
import stream from "stream";
import { promisify } from "util";
import pLimit from "p-limit";
import { rendererLogger } from "common/loggers";
import { shortid } from "./ids";
import { Canceller } from "common/task/cancel";
import { SubTask } from "common/task";

const pipeline = promisify(stream.pipeline);

export type DownloaderDetailsListener = (
  details: ObjectWrapper<SubTask[]>,
  totalPercentage: number
) => unknown;

export interface ParallelDownloadItem {
  unique: number;
  url: string;
  target: string;
}

export type ParallelDownloadItemWithoutUnique = Omit<
  ParallelDownloadItem,
  "unique"
>;

export function createDirByPath(p: string): void {
  ensureDir(path.dirname(p));
}

export function ensureDir(p: string): void {
  try {
    fs.accessSync(p);
  } catch {
    fs.mkdirSync(p, { recursive: true });
  }
}

export function downloadFile(
  url: string,
  target: string,
  canceller?: Canceller
): Promise<void> {
  createDirByPath(target);
  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(target);
  canceller &&
    canceller.update(() => {
      downloadStream.destroy();
      fileWriterStream.destroy();
      fs.rmSync(target);
    });
  return pipeline(downloadStream, fileWriterStream);
}

export async function parallelDownload(
  itemList: ParallelDownloadItemWithoutUnique[],
  onDetailsChange: DownloaderDetailsListener,
  concurrency: number,
  canceller: Canceller
): Promise<void> {
  const counter = new Counter();
  const items = itemList.map((i) => ({ ...i, unique: counter.count() }));
  const details = items.map((i) => ({
    ...i,
    name: path.basename(i.target),
    percentage: 0,
    inProgress: false,
  }));

  // task unique identifier
  const id = shortid();

  const updateUI = () =>
    onDetailsChange(
      new ObjectWrapper<SubTask[]>(details),
      Math.floor(
        details.map((i) => i.percentage).reduce((a, b) => a + b) /
          details.length
      )
    );

  const limit = pLimit(concurrency);
  const promises = items.map((item) =>
    limit(async () => {
      if (canceller.cancelled) {
        return;
      }
      const downloadStream = got.stream(item.url);
      createDirByPath(item.target);
      const fileWriterStream = createWriteStream(item.target);
      downloadStream.on("downloadProgress", ({ percent }) => {
        const percentage = Math.floor(percent * 100);
        const detail = details.find((i) => i.unique === item.unique);
        if (detail) {
          if (percentage === 100) {
            detail.inProgress = false;
          } else if (percentage >= 0 && percentage < 100) {
            detail.inProgress = true;
          }
          detail.percentage = percentage;
        }
        updateUI();
      });
      canceller &&
        canceller.update(() => {
          downloadStream.destroy();
          fileWriterStream.destroy();
          fs.rmSync(item.target);
        });
      await pipeline(downloadStream, fileWriterStream);
    })
  );

  rendererLogger.info(`Download queue#${id} created (${promises.length})`);
  await Promise.all(promises);
  rendererLogger.info(`Download queue#${id} finished`);
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

export function copyFolder(
  src: string,
  target: string,
  noGoodList?: string[]
): void {
  ensureDir(target);
  for (const i of fs.readdirSync(src)) {
    const pathname = path.join(src, i);
    if (noGoodList && noGoodList.indexOf(i) !== -1) {
      continue;
    }
    if (fs.statSync(pathname).isDirectory()) {
      copyFolder(pathname, path.join(target, i));
    } else {
      fs.copyFileSync(pathname, path.join(target, i));
    }
  }
}

export function rmFolder(src: string): void {
  for (const i of fs.readdirSync(src)) {
    const pathname = path.join(src, i);
    if (fs.statSync(pathname).isDirectory()) {
      rmFolder(pathname);
    } else {
      fs.rmSync(pathname);
    }
  }
  fs.rmdirSync(src);
}
