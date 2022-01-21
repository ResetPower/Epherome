import { MinecraftVersion } from "core/launch/versions";
import path from "path";
import fs from "fs";
import { configStore } from "common/struct/config";
import { ClientJson } from "core/launch/struct";
import { analyzeAssets, analyzeLibrary } from "core/launch/libraries";
import {
  calculateHash,
  createDirByPath,
  downloadFile,
  parallelDownload,
} from "common/utils/files";
import { coreLogger } from "common/loggers";
import { DownloaderDetailsListener } from "common/utils/files";
import { MinecraftUrlUtil } from "core/url";
import { ephDefaultDotMinecraft } from "common/utils/info";
import { Canceller } from "common/task/cancel";

export async function downloadMinecraft(
  version: MinecraftVersion,
  onDetailsChange: DownloaderDetailsListener,
  canceller: Canceller,
  dest?: string
): Promise<void> {
  const vid = dest ?? version.id;
  const urlUtil = MinecraftUrlUtil.fromDefault();

  const versionDir = path.join(ephDefaultDotMinecraft, "versions", vid);
  coreLogger.info(
    `Start downloading Minecraft ${version.id}${
      dest ? `(${dest})` : ""
    } to "${versionDir}"`
  );

  const jsonFilename = `${vid}.json`;
  const jsonPath = path.join(versionDir, jsonFilename);
  createDirByPath(jsonPath);

  await downloadFile(urlUtil.clientJson(version), jsonPath, canceller);

  // read content from json file
  const data = fs.readFileSync(jsonPath).toString();
  coreLogger.info(`"${jsonFilename}" fetched`);

  // parse libraries
  const parsed: ClientJson = JSON.parse(data);
  const libraries = await analyzeLibrary(
    ephDefaultDotMinecraft,
    parsed.libraries
  );

  // parse assets
  const assets = await analyzeAssets(
    ephDefaultDotMinecraft,
    parsed.assetIndex,
    canceller
  );

  coreLogger.info(`Download requirements in "${jsonFilename}" parsed`);

  // resolve jar
  const client = parsed.downloads.client;
  const jarPath = path.join(versionDir, `${vid}.jar`);
  const noNeedToDownloadJar =
    fs.existsSync(jarPath) && client.sha1 === calculateHash(jarPath, "sha1");

  await parallelDownload(
    [
      ...(noNeedToDownloadJar
        ? []
        : [
            {
              url: client.url,
              target: jarPath,
            },
          ]),
      ...libraries.missing.map((i) => ({
        url: i.url,
        target: i.path,
      })),
      ...assets.missing.map((i) => ({
        url: i.url,
        target: i.path,
      })),
    ],
    onDetailsChange,
    configStore.downloadConcurrency,
    canceller
  );
}
