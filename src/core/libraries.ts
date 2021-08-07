import fs from "fs";
import path from "path";
import { isCompliant, equalOS } from "./rules";
import { coreLogger } from ".";
import {
  ClientAnalyzedAsset,
  ClientAnalyzedLibrary,
  ClientAssetsResult,
  ClientJsonAssetIndex,
  ClientJsonLibraries,
  ClientLibraryResult,
} from "./struct";
import { downloadFile } from "./stream";

export async function analyzeLibrary(
  dir: string,
  libraries: ClientJsonLibraries
): Promise<ClientLibraryResult> {
  const classpath: string[] = [];
  const missing: ClientAnalyzedLibrary[] = [];
  const natives: string[] = [];

  for (const lib of libraries) {
    if (lib.rules) {
      // skip if rule not compliant
      if (!isCompliant(lib.rules)) continue;
    }

    if (lib.downloads) {
      const downloads = lib.downloads;
      if (downloads.classifiers) {
        // with `classifier` key (It seems to be native library)
        const classifiers = downloads.classifiers;
        if (lib.natives) {
          for (const nativeKey in lib.natives) {
            const native = lib.natives[nativeKey];
            if (equalOS(nativeKey)) {
              const file = `${dir}/libraries/${classifiers[native].path}`;
              try {
                fs.accessSync(file);
              } catch (e) {
                coreLogger.warn(`Native library file ${file} not exists`);
                const nativeObj = classifiers[native];
                missing.push({
                  name: nativeObj.path.split("/").pop() ?? "",
                  path: `${dir}/libraries/${nativeObj.path}`,
                  url: nativeObj.url,
                  sha1: nativeObj.sha1,
                });
              }
              natives.push(file);
            }
          }
        }
      } else if (downloads.artifact) {
        // has artifact only: java cross-platform library
        const ar = downloads.artifact;
        const file = `${dir}/libraries/${ar.path}`;
        try {
          fs.accessSync(file);
        } catch (e) {
          coreLogger.warn(`Library file ${file} not exists`);
          missing.push({
            name: ar.path.split("/").pop() ?? "",
            path: `${dir}/libraries/${ar.path}`,
            url: ar.url,
            sha1: ar.sha1,
          });
        }
        classpath.push(file);
      }
    } else if (lib.name) {
      // with only `name` and `url` key (It seems to be LiteLoader or Fabric)
      const name = lib.name.split(":");
      const url = lib.url;
      const p = path.join(
        dir,
        "libraries",
        name[0].split(".").join("/"),
        name[1],
        name[2],
        `${name[1]}-${name[2]}.jar`
      );

      try {
        fs.accessSync(p);
      } catch (e) {
        // file not exists, add to missing
        coreLogger.warn(`Library file ${p} not exists`);

        if (url) {
          const urlObject = new URL(url);
          urlObject.pathname = `${name[0].split(".").join("/")}/${name[1]}/${
            name[2]
          }/${name[1]}-${name[2]}.jar`;
          missing.push({
            name: `${name[1]}-${name[2]}.jar`,
            url: urlObject.href,
            path: p,
          });
        }
      }
      classpath.push(p);
    }
  }

  return {
    classpath,
    natives,
    missing,
  };
}

export async function analyzeAssets(
  dir: string,
  assetIndex: ClientJsonAssetIndex
): Promise<ClientAssetsResult> {
  const missing: ClientAnalyzedAsset[] = [];
  const assetIndexPath = path.join(
    dir,
    "assets/indexes",
    `${assetIndex.id}.json`
  );

  if (!fs.existsSync(assetIndexPath)) {
    await downloadFile(assetIndex.url, assetIndexPath);
  }
  const parsedAssetIndex = JSON.parse(
    fs.readFileSync(assetIndexPath).toString()
  );
  for (const k in parsedAssetIndex.objects) {
    const hash = parsedAssetIndex.objects[k].hash;
    const startHash = hash.slice(0, 2);
    const p = path.join(dir, "assets/objects", startHash, hash);
    if (!fs.existsSync(p)) {
      missing.push({
        path: p,
        url: `https://resources.download.minecraft.net/${startHash}/${hash}`,
        hash,
      });
    }
  }

  return { missing };
}
