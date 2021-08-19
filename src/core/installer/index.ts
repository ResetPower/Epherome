import got from "got";
import path from "path";
import fs from "fs";
import { ClientJsonLibraries } from "core/launch/struct";
import { MinecraftProfile } from "common/struct/profiles";
import { MinecraftInstall } from "eph/views/ProfileInstallPage";
import { MinecraftUrlUtils } from "../down/url";
import { createDirByPath } from "common/utils/files";

export type Installer = (profile: MinecraftProfile) => void;

export interface InstallVersion {
  name: string;
  install: Installer;
}

export interface LiteLoaderVersionMeta {
  tweakClass: string;
  libraries: ClientJsonLibraries;
  stream: string;
  timestamp: string;
}

export interface LiteLoaderVersion {
  repo: {
    url: string;
  };
  snapshots: {
    libraries: ClientJsonLibraries;
    "com.mumfrey:liteloader": {
      latest: LiteLoaderVersionMeta;
    };
  };
  artefacts?: {
    "com.mumfrey:liteloader": {
      latest: LiteLoaderVersionMeta;
    };
  };
}

export async function getInstallVersions(
  mc: string,
  type: MinecraftInstall
): Promise<InstallVersion[] | null> {
  if (type === "LiteLoader") {
    const result = await got(MinecraftUrlUtils.LiteLoader.versions());
    const parsed: { versions: { [key: string]: LiteLoaderVersion } } =
      JSON.parse(result.body);
    const version = parsed.versions[mc];
    const defaultUrl = "https://libraries.minecraft.net/";
    const meta = (version.artefacts ?? version.snapshots)[
      "com.mumfrey:liteloader"
    ].latest;
    const time = new Date(+meta.timestamp * 1000).toISOString();
    return [
      {
        name: `${mc}-${meta.stream}`,
        install: (profile) => {
          const versionName = `${mc}-LiteLoader${mc}`;
          const versionDir = path.join(profile.dir, "versions", versionName);
          const jsonFile = path.join(versionDir, `${versionName}.json`);
          createDirByPath(jsonFile);
          const jsonContent = {
            id: versionName,
            type: "release",
            minecraftArguments: `--tweakClass ${meta.tweakClass}`,
            libraries: meta.libraries.map((val) => ({
              name: val.name,
              url: val.url ?? defaultUrl,
            })),
            mainClass: "net.minecraft.launchwrapper.Launch",
            inheritsFrom: mc,
            releaseTime: time,
            time,
          };
          fs.writeFileSync(jsonFile, JSON.stringify(jsonContent));
        },
      },
    ];
  } else {
    return [];
  }
}
