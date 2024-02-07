import { cfg } from "../../stores/config";
import { ClientJson, ClientJsonAssetIndex } from "../launch/struct";
import { MinecraftVersion } from "../versions";
import authlibUrlUtil from "./authlib";
import fabricUrlUtil from "./fabric";
import liteloaderUrlUtil from "./liteloader";

export type MinecraftDownloadProvider = "official" | "bmclapi" | "mcbbs";

function replaceHost(source: string, host: string): string {
  const url = new URL(source);
  url.host = host;
  return url.href;
}

export class MinecraftUrlUtil {
  provider: MinecraftDownloadProvider;
  fabric;
  liteloader;
  authlib;
  static fromDefault(): MinecraftUrlUtil {
    return new MinecraftUrlUtil(cfg.downloadProvider);
  }
  constructor(provider: MinecraftDownloadProvider) {
    this.provider = provider;
    this.fabric = fabricUrlUtil();
    this.liteloader = liteloaderUrlUtil(this.provider);
    this.authlib = authlibUrlUtil();
  }
  private transferHost(source: string): string {
    switch (this.provider) {
      case "bmclapi":
        return replaceHost(source, "bmclapi2.bangbang93.com");
      case "mcbbs":
        return replaceHost(source, "download.mcbbs.net");
      default:
        return source;
    }
  }
  versionManifest(): string {
    return this.transferHost(
      "https://launchermeta.mojang.com/mc/game/version_manifest.json"
    );
  }
  clientJson(version: MinecraftVersion): string {
    return this.transferHost(version.url);
  }
  clientJar(clientJson: ClientJson): string {
    return this.transferHost(clientJson.downloads.client.url);
  }
  assetIndex(assetIndex: ClientJsonAssetIndex): string {
    return this.transferHost(assetIndex.url);
  }
  assetObject(startHash: string, hash: string): string {
    switch (this.provider) {
      case "bmclapi":
        return `https://bmclapi2.bangbang93.com/assets/${startHash}/${hash}`;
      case "mcbbs":
        return `https://download.mcbbs.net/assets/${startHash}/${hash}`;
      default:
        return `https://resources.download.minecraft.net/${startHash}/${hash}`;
    }
  }
  library(source: string): string {
    if (this.provider === "official") return source;
    const bmclapi = source
      .replace(
        "https://libraries.minecraft.net",
        "https://bmclapi2.bangbang93.com/maven"
      )
      .replace(
        "https://files.minecraftforge.net/maven",
        "https://bmclapi2.bangbang93.com/maven"
      )
      .replace(
        "https://meta.fabricmc.net",
        "https://bmclapi2.bangbang93.com/fabric-meta"
      )
      .replace(
        "https://maven.fabricmc.net",
        "https://bmclapi2.bangbang93.com/maven"
      );
    switch (this.provider) {
      case "mcbbs":
        return bmclapi.replace("bmclapi2.bangbang93.com", "download.mcbbs.net");
      default:
        return bmclapi;
    }
  }
}
