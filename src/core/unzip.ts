import StreamZip from "node-stream-zip";
import { coreLogger } from ".";

export function unzipNatives(dir: string, natives: string[]): void {
  for (const file of natives) {
    const zip = new StreamZip({
      file: file,
      storeEntries: true,
    });
    zip.on("ready", () => {
      zip.extract(null, dir, (err, count) => {
        zip.close();
        if (err) {
          coreLogger.error(`Error occurred in unzipping File "${file}", unzipped ${count} files`);
        }
      });
    });
  }
}
