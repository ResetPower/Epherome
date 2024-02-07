import { exists, readTextFile } from "@tauri-apps/api/fs";
import { isCompliant, equalOS } from "./rules";
import {
  ClientAnalyzedAsset,
  ClientAnalyzedLibrary,
  ClientAssetsResult,
  ClientJsonAssetIndex,
  ClientJsonLibraries,
  ClientLibraryResult,
} from "./struct";
import { path } from "@tauri-apps/api";
import { MinecraftUrlUtil } from "../url";
import { downloadFile, fetchSize } from "../../utils/file";

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
              const nativeObj = classifiers[native];
              const file = `${dir}/libraries/${nativeObj.path}`;
              let miss = false;
              if (await exists(file)) {
                /*if (
                  nativeObj.sha1 &&
                  nativeObj.sha1 !== (await calculateHash(file, "sha1"))
                ) {
                  miss = true;
                }*/
              } else {
                console.warn(`Native library file ${file} not exists`);
                miss = true;
              }
              miss &&
                missing.push({
                  name: nativeObj.path.split("/").pop() ?? "",
                  path: `${dir}/libraries/${nativeObj.path}`,
                  url: nativeObj.url,
                  sha1: nativeObj.sha1,
                  size: nativeObj.size,
                });
              natives.push(file);
            }
          }
        }
      } else if (downloads.artifact) {
        // has artifact only: java cross-platform library
        const ar = downloads.artifact;
        const file = `${dir}/libraries/${ar.path}`;
        let miss = false;
        if (await exists(file)) {
          /*if (ar.sha1 && ar.sha1 !== (await calculateHash(file, "sha1"))) {
            miss = true;
          }*/
        } else {
          console.warn(`Library file ${file} not exists`);
          miss = true;
        }
        miss &&
          missing.push({
            name: ar.path.split("/").pop() ?? "",
            path: `${dir}/libraries/${ar.path}`,
            url: ar.url,
            sha1: ar.sha1,
            size: ar.size,
          });
        classpath.push(file);
      }
    } else if (lib.name) {
      // with only `name` and `url` key (It seems to be LiteLoader or Fabric)
      const name = lib.name.split(":");
      const url = lib.url ?? "https://libraries.minecraft.net/";
      const p = await path.join(
        dir,
        "libraries",
        name[0].split(".").join("/"),
        name[1],
        name[2],
        `${name[1]}-${name[2]}.jar`
      );

      if (!(await exists(p))) {
        console.warn(`Library file ${p} not exists`);
        if (url) {
          let urlObject = url;
          if (!urlObject.endsWith("/")) {
            urlObject += "/";
          }
          urlObject += `${name[0].split(".").join("/")}/${name[1]}/${name[2]}/${
            name[1]
          }-${name[2]}.jar`;
          const filename = `${name[1]}-${name[2]}.jar`;
          const size = await fetchSize(urlObject);
          missing.push({
            name: filename,
            url: urlObject,
            path: p,
            size,
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
  const assetIndexPath = await path.join(
    dir,
    "assets/indexes",
    `${assetIndex.id}.json`
  );

  if (!(await exists(assetIndexPath))) {
    await downloadFile(assetIndex.url, assetIndexPath);
  }
  const parsedAssetIndex = JSON.parse(await readTextFile(assetIndexPath));
  for (const k in parsedAssetIndex.objects) {
    // Never try to optimize here. parsedAssetIndex.objects is not iterable.
    const obj = parsedAssetIndex.objects[k];
    const hash = obj.hash;
    const size = obj.size;
    const startHash = hash.slice(0, 2);
    const p = await path.join(dir, "assets/objects", startHash, hash);
    let miss = false;
    if (await exists(p)) {
      /*if (hash && hash !== calculateHash(p, "sha1")) {
        miss = true;
      }*/
    } else {
      miss = true;
    }
    miss &&
      missing.push({
        path: p,
        url: MinecraftUrlUtil.fromDefault().assetObject(startHash, hash),
        hash,
        size,
      });
  }

  return { missing };
}
