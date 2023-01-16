import { EphExtension } from "common/extension";
import { userDataPath } from "common/utils/info";
import fs from "fs";
import path from "path";
import { interpret } from "../interpret";

const extPath = path.join(userDataPath, "ext");

export function parseExtension(nid: string): EphExtension | null {
  const ext = path.join(extPath, nid);
  const readmeFile = path.join(ext, "README.md");
  const manifestFile = path.join(ext, "manifest.json");
  if (fs.existsSync(manifestFile)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
      const readme = fs.existsSync(readmeFile)
        ? fs.readFileSync(readmeFile).toString()
        : String();
      return {
        id: nid,
        pathname: ext,
        manifest,
        readme,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    return null;
  }
}

export function loadExtensions() {
  const extensions: EphExtension[] = [];
  const files = fs.readdirSync(extPath);

  for (const file of files) {
    const ext = path.join(extPath, file);
    const stat = fs.lstatSync(ext);
    if (stat.isFile()) {
      continue;
    }
    const result = parseExtension(file);
    if (result) {
      interpret(path.join(ext, result.manifest.entry), result);
      extensions.push(result);
    }
  }

  return extensions;
}
