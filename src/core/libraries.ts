import fs from "fs";
import { isCompliant, equalOS } from "./rules";
import { loggerCore } from "./launch";
import { ClientAnalyzedLibrary, ClientJsonLibraries, ClientLibraryResult } from "./struct";

export function analyzeLibrary(dir: string, libraries: ClientJsonLibraries): ClientLibraryResult {
  const classpath: string[] = [];
  const missing: ClientAnalyzedLibrary[] = [];
  const natives: string[] = [];

  for (const lib of libraries) {
    if (lib.rules && !isCompliant(lib.rules)) {
      // skip if rule not compliant
      continue;
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
                loggerCore.warn(`Native library file ${file} not exists`);
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
          loggerCore.warn(`Library file ${file} not exists`);
          missing.push({
            name: ar.path.split("/").pop() ?? "",
            path: `${dir}/libraries/${ar.path}`,
            url: ar.url,
            sha1: ar.sha1,
          });
        }
        classpath.push(file);
      }
    } else if (lib.name && lib.url) {
      // with only `name` and `url` key (It seems to be LiteLoader or Fabric)
      const name = lib.name.split(":");
      const url = lib.url;
      const path = `${dir}/libraries/${name[0].split(".").join("/")}/${name[1]}/${name[2]}/${
        name[1]
      }-${name[2]}.jar`;

      try {
        fs.accessSync(path);
      } catch (e) {
        // file not exists, add to missing
        loggerCore.warn(`Library file ${path} not exists`);
        missing.push({ name: `${name[1]}-${name[2]}`, url: `${dir}/libraries/${url}`, path });
      }
      classpath.push(path);
    }
  }
  return {
    classpath,
    natives,
    missing,
  };
}
