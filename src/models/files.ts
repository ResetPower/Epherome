import fs from "fs";
import got from "got";
import path from "path";
import crypto from "crypto";
import { adapt, DefaultFn } from "../tools";
import { MutableRefObject } from "react";
import { shell } from "electron";

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
  cancellerWrapper?: MutableRefObject<DefaultFn | undefined>
): Promise<void> {
  return new Promise((resolve, reject) => {
    createDirByPath(target);
    const downloadStream = got.stream(url);
    const fileStream = fs.createWriteStream(target);
    downloadStream.on("error", reject);
    fileStream.on("error", reject).on("finish", resolve);
    cancellerWrapper &&
      (cancellerWrapper.current = () => {
        try {
          downloadStream.destroy();
          fileStream.destroy();
          fs.rmSync(target);
        } catch {}
      });
    downloadStream.pipe(fileStream);
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
        adapt([".jar", ".litemod", ".zip", ".disabled"], path.extname(file))
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
