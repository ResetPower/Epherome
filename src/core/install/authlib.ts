import { fetch } from "@tauri-apps/api/http";
import { MinecraftUrlUtil } from "../url";
import { downloadFile } from "../../utils/file";

export async function installAuthlibInjector(
  target: string,
  util: MinecraftUrlUtil
) {
  const resp = (await fetch(util.authlib.latest(), { method: "GET" }))
    .data as Record<string, unknown>;
  if ("download_url" in resp && typeof resp.download_url === "string") {
    await downloadFile(resp.download_url, target);
  } else {
    throw new Error("Bad response from authlib-injector latest artifact.");
  }
}
