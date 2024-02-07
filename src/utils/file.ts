import { path } from "@tauri-apps/api";
import {
  BinaryFileContents,
  writeBinaryFile,
  createDir,
  exists,
} from "@tauri-apps/api/fs";
import { ResponseType, fetch } from "@tauri-apps/api/http";

export async function ensureDir(p: string): Promise<boolean> {
  if (await exists(p)) {
    return true;
  } else {
    await createDir(p, { recursive: true });
    return false;
  }
}

export async function createDirByPath(p: string): Promise<void> {
  await ensureDir(await path.dirname(p));
}

/*export async function calculateHash(
  file: string,
  type: AlgorithmIdentifier
): Promise<string> {
  const dataBytes = await readBinaryFile(file);
  const digest = await crypto.subtle.digest(type, dataBytes);
  return [...new Uint8Array(digest)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}*/

export async function downloadFile(url: string, target: string): Promise<void> {
  const data = (
    await fetch(url, {
      method: "GET",
      responseType: ResponseType.Binary,
    })
  ).data as BinaryFileContents;
  await createDirByPath(target);
  await writeBinaryFile(target, data);
}

// WARN: the return value is possibly NaN
export async function fetchSize(url: string): Promise<number> {
  const resp = await fetch(url, { method: "HEAD" });
  return parseInt(resp.headers["content-length"]);
}
