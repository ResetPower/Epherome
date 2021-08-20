import StreamZip from "node-stream-zip";

// unzip a list of native libraries to a target directory
export async function unzipNatives(
  target: string,
  natives: string[]
): Promise<void> {
  for (const file of natives) {
    await extractZipFile(file, target);
  }
}

export function extractZipFile(file: string, target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({ file, storeEntries: true });
    zip.on("ready", () =>
      zip.extract(null, target, (err) => {
        zip.close();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    );
  });
}
