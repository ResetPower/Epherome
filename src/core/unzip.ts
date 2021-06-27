import StreamZip from "node-stream-zip";
import { loggerCore } from ".";

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
          loggerCore.error(`Error Occurred in Unzipping File "${file}". Unzipped ${count} Files.`);
        }
      });
    });
  }
}
