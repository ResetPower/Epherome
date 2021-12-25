import { MinecraftProfile } from "common/struct/profiles";
import { downloadFile } from "common/utils/files";
import { MinecraftUrlUtil } from "core/url";
import got from "got";
import path from "path";
import { InstallVersion } from ".";

export interface FabricLoaderVersion {
  separator: string;
  build: number;
  maven: string;
  version: string;
  stable: boolean;
}

export interface FabricGameVersion {
  version: string;
  stable: boolean;
}

async function installFabric(
  profile: MinecraftProfile,
  mc: string,
  loader: string
) {
  const urlUtil = MinecraftUrlUtil.fromDefault();
  const url = urlUtil.fabricJson(mc, loader);
  profile.ver = `fabric-loader-${loader}-${mc}`;
  const target = path.join(
    profile.dir,
    "versions",
    profile.ver,
    `${profile.ver}.json`
  );
  await downloadFile(url, target);
}

export async function getFabricInstallVersions(
  mc: string
): Promise<InstallVersion[]> {
  const urlUtil = MinecraftUrlUtil.fromDefault();
  const rLoaders = (await got(urlUtil.fabricLoaders())).body;
  const rGames = (await got(urlUtil.fabricGames())).body;
  const loaders: FabricLoaderVersion[] = JSON.parse(rLoaders);
  const games: FabricGameVersion[] = JSON.parse(rGames);
  if (!games.find((val) => val.version === mc)) {
    return [];
  }
  return loaders.map((loader) => ({
    name: loader.version,
    install: (profile) => installFabric(profile, mc, loader.version),
  }));
}
