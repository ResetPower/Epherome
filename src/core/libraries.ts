import fs from "fs";
import path from "path";
import { removePrefix } from "../tools/strings";
import { isCompliant, equalOS } from "./rules";
import { loggerCore } from "./core";

/**
 * returns a object contains (cp, missing, natives)
 * cp: classpath
 * missing: list of 'artifact' or 'natives-${platform}' object (cross-platform or native library or native library, need to download), contains (path, sha1, size, url)
 * nativeLibs: list of string (only native library, need to unzip)
 */
export function analyzeLibrary(dir: string, library: any): any {
  loggerCore.info("Analyzing Library in JSON");
  const buff = [];
  const missing = [];
  const nativeLibs = [];
  for (const i in library) {
    const l = library[i];
    if (Object.prototype.hasOwnProperty.call(l, "rules")) {
      if (!isCompliant(l["rules"])) {
        continue;
      }
    }
    const d = l["downloads"];
    if (Object.prototype.hasOwnProperty.call(d, "classifiers")) {
      // has classifier (maybe it also has artifact): native library
      const cl = d["classifiers"];
      if (Object.prototype.hasOwnProperty.call(l, "rules")) {
        if (!isCompliant(l["rules"])) {
          continue;
        }
      }
      if (Object.prototype.hasOwnProperty.call(l, "natives")) {
        const natives = l["natives"];
        for (const i in natives) {
          const n = natives[i];
          if (equalOS(removePrefix(n, "natives-"))) {
            const file = `${dir}/libraries/${cl[n]["path"]}`;
            try {
              fs.accessSync(file);
            } catch (e) {
              loggerCore.warn(`Native library file ${file} not exists`);
              missing.push(cl[n]);
            }
            nativeLibs.push(file);
          }
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(d, "artifact")) {
      // has artifact only: java cross-platform library
      const ar = d["artifact"];
      const file = `${dir}/libraries/${ar["path"]}`;
      try {
        fs.accessSync(file);
      } catch (e) {
        loggerCore.warn(`Library file ${file} not exists`);
        missing.push(ar);
      }
      buff.push(file);
    }
  }
  return {
    cp: buff,
    missing: missing,
    nativeLibs: nativeLibs,
  };
}

export function analyzeModLibrary(dir: string, library: any): any {
  loggerCore.info("Analyzing Mod Library in JSON");
  const buff = [];
  const missing = [];
  const nativeLibs = [];
  for (const i in library) {
    const l = library[i];
    if (Object.prototype.hasOwnProperty.call(l, "rules")) {
      if (!isCompliant(l["rules"])) {
        continue;
      }
    }
    if (l.hasOwnProperty("downloads")) {
      // forge
      const d = l["downloads"];
      if (Object.prototype.hasOwnProperty.call(d, "classifiers")) {
        // has classifier (maybe it also has artifact): native library
        const cl = d["classifiers"];
        if (Object.prototype.hasOwnProperty.call(l, "rules")) {
          if (!isCompliant(l["rules"])) {
            continue;
          }
        }
        if (Object.prototype.hasOwnProperty.call(l, "natives")) {
          const natives = l["natives"];
          for (const i in natives) {
            const n = natives[i];
            if (equalOS(removePrefix(n, "natives-"))) {
              const file = `${dir}/libraries/${cl[n]["path"]}`;
              try {
                fs.accessSync(file);
              } catch (e) {
                loggerCore.warn(`Native library file ${file} not exists`);
                missing.push(cl[n]);
              }
              nativeLibs.push(file);
            }
          }
        }
      } else if (Object.prototype.hasOwnProperty.call(d, "artifact")) {
        // has artifact only: java cross-platform library
        const ar = d["artifact"];
        const file = `${dir}/libraries/${ar["path"]}`;
        try {
          fs.accessSync(file);
        } catch (e) {
          loggerCore.warn(`Library file ${file} not exists`);
          missing.push(ar);
        }
        buff.push(file);
      }
    } else {
      // fabric
      const name = l.name.split(":");
      const file = `${dir}/libraries/${name[0].replaceAll(".", path.sep)}/${name[1]}/${name[2]}/${
        name[1]
      }-${name[2]}.jar`;
      try {
        fs.accessSync(file);
      } catch (e) {
        loggerCore.warn(`Library file ${file} not exists`);
        missing.push(l);
      }
      buff.push(file);
    }
  }
  return {
    cp: buff,
    missing: missing,
    nativeLibs: nativeLibs,
  };
}
