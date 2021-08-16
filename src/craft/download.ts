import { MinecraftVersion } from "./versions";
import path from "path";
import fs from "fs";
import { configStore, minecraftDownloadPath } from "../struct/config";
import { DefaultFn, ErrorHandler } from "../tools";
import { ClientJson } from "../core/struct";
import { analyzeAssets, analyzeLibrary } from "../core/libraries";
import { calculateHash, createDirByPath, downloadFile } from "../models/files";
import { logger } from "../renderer/global";
import { Downloader, DownloaderDetailsListener } from "../models/downloader";
import { MinecraftUrlUtils } from "./url";
import { MutableRefObject } from "react";

export async function downloadMinecraft(
  version: MinecraftVersion,
  onDetailsChange: DownloaderDetailsListener,
  onError: ErrorHandler,
  onDone: DefaultFn,
  cancellerWrapper?: MutableRefObject<DefaultFn | undefined>
): Promise<Downloader> {
  const versionDir = path.join(minecraftDownloadPath, "versions", version.id);
  logger.info(`Start downloading Minecraft ${version.id} to "${versionDir}"`);

  const jsonFilename = `${version.id}.json`;
  const jsonPath = path.join(versionDir, jsonFilename);
  createDirByPath(jsonPath);

  await downloadFile(
    MinecraftUrlUtils.clientJson(version),
    jsonPath,
    cancellerWrapper
  ).catch(onError);

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
  const assets = await analyzeAssets(
    minecraftDownloadPath,
    parsed.assetIndex,
    cancellerWrapper
  );

  logger.info(`Download requirements in "${jsonFilename}" parsed`);

  // resolve jar
  const client = parsed.downloads.client;
  const jarPath = path.join(versionDir, `${version.id}.jar`);
  const noNeedToDownloadJar =
    fs.existsSync(jarPath) && client.sha1 === calculateHash(jarPath, "sha1");

  return new Downloader({
    taskOptions: [
      ...(noNeedToDownloadJar
        ? []
        : [
            {
              url: client.url,
              path: jarPath,
            },
          ]),
      ...libraries.missing,
      ...assets.missing,
    ].map((val) => ({ url: val.url, target: val.path })),
    concurrency: configStore.downloadConcurrency,
    onDetailsChange,
    onError,
    onDone,
  });
}
