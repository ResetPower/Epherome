import StreamZip from "node-stream-zip";
import { coreLogger } from "common/loggers";

// unzip a list of native libraries to a target directory
export function unzipNatives(target: string, natives: string[]): void {
  for (const file of natives) {
    const zip = new StreamZip({
      file: file,
      storeEntries: true,
    });
    zip.on("ready", () => {
      zip.extract(null, target, (err, count) => {
        zip.close();
        if (err) {
          coreLogger.error(
            `Error occurred in unzipping File "${file}", unzipped ${count} files`
          );
        }
      });
    });
  }
}
