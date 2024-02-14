import { fetch } from "@tauri-apps/api/http";
import { MinecraftVersion, MinecraftVersionManifest } from "../versions";
import { MinecraftUrlUtil } from "../url";
import { createDirByPath, downloadFile } from "../../utils/file";
import { path } from "@tauri-apps/api";
import { writeTextFile } from "@tauri-apps/api/fs";
import { ClientJson } from "../launch/struct";

export async function getVersionManifest(
  urlUtil: MinecraftUrlUtil
): Promise<MinecraftVersionManifest> {
  return (await fetch(urlUtil.versionManifest()))
    .data as MinecraftVersionManifest;
}

export async function installMinecraft(
  dest: string,
  version: MinecraftVersion,
  onStartJar: () => unknown
): Promise<void> {
  const data = (
    await fetch(version.url, {
      method: "GET",
    })
  ).data as ClientJson;
  const target = await path.resolve(
    dest,
    "versions",
    version.id,
    `${version.id}.json`
  );
  await createDirByPath(target);
  await writeTextFile(target, JSON.stringify(data));
  onStartJar();
  console.log(data);
  const jarTarget = await path.resolve(
    dest,
    "versions",
    version.id,
    `${version.id}.jar`
  );
  await downloadFile(data.downloads.client.url, jarTarget);
}
