import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export async function extractZip(file: string, dest: string): Promise<void> {
  const zip = new AdmZip(file);
  return zip.extractAllToAsync(dest, true);
}

export async function compressZip(
  temp: string,
  dest: string
): Promise<boolean> {
  const zip = new AdmZip();
  const list = fs.readdirSync(temp);
  for (const i of list) {
    const file = path.join(temp, i);
    if (fs.statSync(file).isDirectory()) {
      zip.addLocalFolder(file);
    } else {
      zip.addLocalFile(file);
    }
  }
  return await zip.writeZipPromise(dest);
}
