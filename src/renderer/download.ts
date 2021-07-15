import path from "path";
import fs from "fs";
import { constraints } from "./config";

export const mcDownloadPath = path.join(constraints.dir, "minecraft");

try {
  fs.accessSync(mcDownloadPath);
} catch {
  // file does not exist
  fs.mkdirSync(mcDownloadPath);
}
