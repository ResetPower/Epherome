import fs from "fs";
import got from "got";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { EpheromeError } from "../error";

const pipelineAsync = promisify(pipeline);

export function createDirByPath(p: string): void {
  const dir = path.dirname(p);
  try {
    fs.accessSync(dir);
  } catch (e) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function downloadFile(url: string, target: string, recursive = false): Promise<void> {
  if (recursive) {
    createDirByPath(target);
  }
  try {
    await pipelineAsync(got.stream(url), fs.createWriteStream(target));
  } catch (e) {
    console.log("Unable to download: " + url);
    throw new EpheromeError(`Unable to download file at ${url} \n Caused by: ${e.message}`);
  }
}
