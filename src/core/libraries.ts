import fs from "fs";
import { isCompliant, equalOS } from "./rules";
import { loggerCore, Parsed } from "./core";

export interface MissingLibrary {
  name: string;
  path: string;
  url: string;
}

export interface AnalyzedLibraries {
  classpath: string[];
  missing: MissingLibrary[];
  nativeLibs: string[];
}

export function analyzeLibrary(dir: string, libraries: Parsed[]): AnalyzedLibraries {
  const classpath: string[] = [];
  const missing: MissingLibrary[] = [];
  const nativeLibs: string[] = [];
  for (const lib of libraries) {
    if ("rules" in lib) {
      if (!isCompliant(lib.rules)) {
        continue;
      }
    }
    if ("downloads" in lib) {
      const downloads = lib.downloads;
      if ("classifiers" in downloads) {
        // has classifier (maybe it also has artifact): native library
        const classifiers = downloads.classifiers;
        if ("natives" in lib) {
          for (const nativeKey in lib.natives) {
            const native = lib.natives[nativeKey];
            if (equalOS(nativeKey)) {
              const file = `${dir}/libraries/${classifiers[native].path}`;
              try {
                fs.accessSync(file);
              } catch (e) {
                loggerCore.warn(`Native library file ${file} not exists`);
                missing.push({
                  name: classifiers[native].path.split("/").pop(),
                  path: classifiers[native].path,
                  url: classifiers[native].url,
                });
              }
              nativeLibs.push(file);
            }
          }
        }
      } else if ("artifact" in downloads) {
        // has artifact only: java cross-platform library
        const ar = downloads.artifact;
        const file = `${dir}/libraries/${ar["path"]}`;
        try {
          fs.accessSync(file);
        } catch (e) {
          loggerCore.warn(`Library file ${file} not exists`);
          missing.push({
            name: ar.path.split("/").pop(),
            path: ar.path,
            url: ar.url,
          });
        }
        classpath.push(file);
      }
    } else {
      const name = lib.name.split(":");
      const url = lib.url;
      const path = `${dir}/libraries/${name[0].replaceAll(".", "/")}/${name[1]}/${name[2]}/${
        name[1]
      }-${name[2]}.jar`;
      try {
        fs.accessSync(path);
      } catch (e) {
        loggerCore.warn(`Library file ${path} not exists`);
        missing.push({ name: `${name[1]}-${name[2]}`, url, path });
      }
      classpath.push(path);
    }
  }
  return {
    classpath,
    missing,
    nativeLibs,
  };
}
