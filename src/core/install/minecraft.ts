import { fetch } from "@tauri-apps/api/http";
import { MinecraftVersionManifest } from "../versions";
import { MinecraftUrlUtil } from "../url";

export async function getVersionManifest(
  urlUtil: MinecraftUrlUtil
): Promise<MinecraftVersionManifest> {
  return (await fetch(urlUtil.versionManifest()))
    .data as MinecraftVersionManifest;
}
