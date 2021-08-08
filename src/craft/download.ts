import { MinecraftVersion } from "./versions";
import path from "path";
import fs from "fs";
import got from "got";
import { minecraftDownloadPath } from "../struct/config";
import { DefaultFn, ErrorHandler } from "../tools";
import { ClientJson } from "../core/struct";
import { analyzeAssets, analyzeLibrary } from "../core/libraries";
import { createDirByPath } from "../core/stream";
import { logger } from "../renderer/global";
import { Downloader, DownloaderDetailsListener } from "../models/downloader";
import { MinecraftUrlUtils } from "./url";

export async function* downloadMinecraft(
  version: MinecraftVersion,
  onDetailsChange: DownloaderDetailsListener,
  onError: ErrorHandler,
  onDone: DefaultFn
): AsyncGenerator {
  const versionDir = path.join(minecraftDownloadPath, "versions", version.id);
  logger.info(`Start downloading Minecraft ${version.id} to "${versionDir}"`);

  // download minecraft version json file
  const jsonFilename = `${version.id}.json`;
  const jsonPath = path.join(versionDir, jsonFilename);
  createDirByPath(jsonPath);
  const downloadStream = got.stream(MinecraftUrlUtils.clientJson(version));
  const fileStream = fs.createWriteStream(jsonPath);
  yield () => {
    downloadStream.destroy();
    fileStream.close();
  };
  await new Promise((resolve) =>
    downloadStream.pipe(fileStream).on("error", onError).on("finish", resolve)
  );

  // read content from json file
  const data = fs.readFileSync(jsonPath).toString();
  logger.info(`"${jsonFilename}" fetched`);

  // parse libraries
  const parsed: ClientJson = JSON.parse(data);
  const libraries = await analyzeLibrary(
    minecraftDownloadPath,
    parsed.libraries
  );

  // parse assets
  const assets = await analyzeAssets(minecraftDownloadPath, parsed.assetIndex);

  logger.info(`Download requirements in "${jsonFilename}" parsed`);

  yield new Downloader({
    tasksOptions: [
      {
        url: parsed.downloads.client.url,
        path: path.join(versionDir, `${version.id}.jar`),
      },
      ...libraries.missing,
      ...assets.missing,
    ].map((val) => ({ url: val.url, target: val.path })),
    concurrency: 7,
    onDetailsChange,
    onError,
    onDone,
  });
}
