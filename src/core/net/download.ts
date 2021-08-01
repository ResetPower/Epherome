import fs from "fs";
import got from "got";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { coreLogger } from "../index";

const pipelineAsync = promisify(pipeline);

export function createDirIfNotExist(p: string): void {
  try {
    fs.accessSync(p);
  } catch {
    fs.mkdirSync(p);
  }
}

// create a folder which the file is in
export function createDirByPath(p: string): void {
  const dir = path.dirname(p);
  try {
    fs.accessSync(dir);
  } catch {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function downloadFile(
  url: string,
  target: string,
  recursive = false
): Promise<void> {
  if (recursive) {
    createDirByPath(target);
  }
  try {
    await pipelineAsync(got.stream(url), fs.createWriteStream(target));
  } catch (e) {
    coreLogger.warn("Unable to download: " + url);
    throw new Error(
      `Unable to download file at ${url} \n Caused by: ${e.message}`
    );
  }
}
