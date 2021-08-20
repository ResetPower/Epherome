import { createDirByPath } from "common/utils/files";
import { MinecraftUrlUtils } from "core/down/url";
import { ClientJsonLibraries } from "core/launch/struct";
import got from "got";
import path from "path";
import fs from "fs";
import { InstallVersion } from ".";

export interface LiteLoaderVersionMeta {
  tweakClass: string;
  libraries: ClientJsonLibraries;
  stream: string;
  timestamp: string;
}

export interface LiteLoaderVersion {
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

function processLib(libraries: ClientJsonLibraries): ClientJsonLibraries {
  for (const i of libraries) {
    if (!i.url && i.name) {
      if (i.name.startsWith("org.ow2.asm")) {
        i.url = "https://files.minecraftforge.net/maven/";
      }
    }
  }
  return libraries;
}

export async function getLiteLoaderInstallVersions(
  mc: string
): Promise<InstallVersion[]> {
  const result = await got(MinecraftUrlUtils.LiteLoader.versions());
  const parsed: { versions: { [key: string]: LiteLoaderVersion } } = JSON.parse(
    result.body
  );
  const version = parsed.versions[mc];
  const latests = [
    ...(version.artefacts
      ? [version.artefacts["com.mumfrey:liteloader"].latest]
      : []),
    version.snapshots["com.mumfrey:liteloader"].latest,
  ];
  return latests.map((latest) => {
    const stream = latest.stream;
    const time = new Date(+latest.timestamp * 1000).toISOString();
    return {
      name: `${mc}-${stream}`,
      install: async (profile) => {
        profile.ver = `${mc}-LiteLoader-${stream}`;
        const versionDir = path.join(profile.dir, "versions", profile.ver);
        const jsonFile = path.join(versionDir, `${profile.ver}.json`);
        createDirByPath(jsonFile);
        const jsonContent = {
          id: mc,
          jar: mc,
          type: "release",
          minecraftArguments: `--tweakClass ${latest.tweakClass}`,
          libraries: [
            {
              name: `com.mumfrey:liteloader:${mc}${
                stream === "SNAPSHOT" ? "-SNAPSHOT" : ""
              }`,
              url: "https://dl.liteloader.com/versions",
            },
            ...processLib(latest.libraries),
          ],
          mainClass: "net.minecraft.launchwrapper.Launch",
          inheritsFrom: mc,
          releaseTime: time,
          time,
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonContent));
      },
    };
  });
}
