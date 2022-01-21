import { ephDefaultDotMinecraft, userDataPath } from "common/utils/info";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { MinecraftProfile } from "common/struct/profiles";
import { defaultJvmArgs } from "common/struct/java";
import {
  copyFolder,
  DownloadDetail,
  ensureDir,
  rmFolder,
} from "common/utils/files";
import { downloadMinecraft } from "./installer/minecraft";
import { MinecraftUrlUtil } from "./url";
import { configStore } from "common/struct/config";
import got from "got";
import { MinecraftVersion } from "./launch/versions";
import { Canceller } from "common/task/cancel";
import { getInstallVersions, MinecraftInstall } from "./installer";
import { ObjectWrapper } from "common/utils/object";
import { coreLogger } from "common/loggers";
import { ClientJson } from "./launch/struct";

export interface ModpackModLoader {
  id: string;
  primary?: boolean;
}

export interface ModpackManifest {
  name: string;
  version: string;
  author: string;
  overrides?: string;
  minecraft: { version: string; modLoaders: ModpackModLoader[] };
}

export type ModpackImportDetailReader = (
  helper: string,
  details?: [ObjectWrapper<DownloadDetail[]>, number]
) => void;

async function installModLoader(
  mcVer: string,
  verName: string,
  install: MinecraftInstall,
  profile: MinecraftProfile
) {
  const versions = await getInstallVersions(mcVer, install);
  // find suitable version for loader id
  coreLogger.info(`Finding version ${verName} for ${install}`);
  const version = versions.find((v) => v.name === verName);
  if (version) {
    await version.install(profile, true);
  } else {
    coreLogger.warn(`Unable to find ${install}-${verName}, use latest`);
    await versions[0].install(profile, true);
  }
}

async function resolveModpack(
  root: string,
  manifest: string,
  detailReader: ModpackImportDetailReader,
  canceller: Canceller
): Promise<MinecraftProfile> {
  detailReader("Reading Modpack");

  const manifestJson: ModpackManifest = JSON.parse(
    fs.readFileSync(manifest).toString()
  );

  const name = manifestJson.name;
  const mcVer = manifestJson.minecraft.version;
  const mcDest = path.join(ephDefaultDotMinecraft, "versions", name);

  ensureDir(mcDest);

  if (manifestJson.overrides) {
    const overrides = path.join(root, manifestJson.overrides);
    copyFolder(overrides, mcDest);
  }

  // install minecraft
  const util = new MinecraftUrlUtil(configStore.downloadProvider);
  const versions: MinecraftVersion[] = JSON.parse(
    (await got(util.versionManifest())).body
  ).versions;
  const minecraftVersion = versions.find((v) => v.id === mcVer);

  const profile: MinecraftProfile = {
    name,
    ver: name,
    realVer: mcVer,
    dir: ephDefaultDotMinecraft,
    jvmArgs: defaultJvmArgs(),
    gameDirIsolation: true,
    safeLog4j: true,
    from: "import",
    modpackInfo: {
      name,
      version: manifestJson.version,
      author: manifestJson.author,
    },
  };

  if (minecraftVersion) {
    await downloadMinecraft(
      minecraftVersion,
      (d, t) => {
        detailReader("Installing Minecraft", [d, t]);
      },
      canceller,
      name
    );
    detailReader("Installing Mod Loader");
    for (const i of manifestJson.minecraft.modLoaders) {
      const split = i.id.split("-");
      // install mod loader
      if (split[0].toLowerCase() === "liteloader") {
        await installModLoader(mcVer, split[1], "LiteLoader", profile);
        break;
      } else if (split[0].toLowerCase() === "fabric") {
        await installModLoader(mcVer, split[1], "Fabric", profile);
        break;
      }
    }
  }

  return profile;
}

export async function importModpack(
  filename: string,
  canceller: Canceller,
  detailReader: ModpackImportDetailReader,
  theId?: string
): Promise<MinecraftProfile | null> {
  const id = theId ?? nanoid();
  const destination = path.join(userDataPath, "modpackTemp", id);
  ensureDir(destination);
  detailReader("Unzipping");
  await new Promise((resolve) =>
    window.native.extractZip(filename, destination, resolve)
  );
  const manifest = path.join(destination, "manifest.json");
  const bbsMeta = path.join(destination, "mcbbs.packmeta");
  if (!fs.existsSync(manifest) || !fs.existsSync(bbsMeta)) {
    // resolve nested modpack
    const modpackZip = path.join(destination, "modpack.zip");
    if (!fs.existsSync(modpackZip)) {
      return null;
    }
    return importModpack(modpackZip, canceller, detailReader, id);
  } else {
    const profile = await resolveModpack(
      destination,
      manifest,
      detailReader,
      canceller
    );
    // do cleanup
    rmFolder(destination);
    return profile;
  }
}

export async function exportModpack(
  profile: MinecraftProfile,
  realGameDir: string,
  dest: string,
  noGoodList: string[],
  info: [string, string, string]
): Promise<void> {
  const id = nanoid();
  const temp = path.join(userDataPath, "modpackTemp", id);
  ensureDir(temp);
  let modLoaderId = "";

  // parse mod loaders
  const json = path.join(
    profile.dir,
    "versions",
    profile.ver,
    `${profile.ver}.json`
  );
  const parsed: ClientJson = JSON.parse(fs.readFileSync(json).toString());
  if (parsed.inheritsFrom) {
    if (parsed.id.toLowerCase().indexOf("fabric") !== -1) {
      modLoaderId = `fabric-${
        parsed.id.slice("fabric-loader-".length).split("-")[0]
      }`;
    } else if (parsed.id.toLowerCase().indexOf("liteloader") !== -1) {
      modLoaderId = `liteloader-${parsed.id}`;
    }
  }

  const manifest: ModpackManifest = {
    name: info[0],
    version: info[1],
    author: info[2],
    overrides: "overrides",
    minecraft: {
      version: parsed.inheritsFrom ?? parsed.id,
      modLoaders: modLoaderId ? [{ id: modLoaderId, primary: true }] : [],
    },
  };
  fs.writeFileSync(path.join(temp, "manifest.json"), JSON.stringify(manifest));

  // prepare overrides
  copyFolder(realGameDir, path.join(temp, "overrides"), noGoodList);

  // make zip
  await new Promise((resolve) =>
    window.native.compressZip(temp, dest, resolve)
  );
}
