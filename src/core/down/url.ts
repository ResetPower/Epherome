import { ClientJson, ClientJsonAssetIndex } from "core/launch/struct";
import { configStore } from "common/struct/config";
import { MinecraftVersion } from "../launch/versions";

export type MinecraftDownloadProvider = "official" | "bmclapi" | "mcbbs";

export const MinecraftUrlUtils = {
  get _provider(): MinecraftDownloadProvider {
    return configStore.downloadProvider;
  },
  _transferHost(source: string): string {
    switch (this._provider) {
      case "bmclapi":
        return replaceHost(source, "bmclapi2.bangbang93.com");
      case "mcbbs":
        return replaceHost(source, "download.mcbbs.net");
      default:
        return source;
    }
  },
  versionManifest(): string {
    return this._transferHost(
      "https://launchermeta.mojang.com/mc/game/version_manifest.json"
    );
  },
  clientJson(version: MinecraftVersion): string {
    return this._transferHost(version.url);
  },
  clientJar(clientJson: ClientJson): string {
    return this._transferHost(clientJson.downloads.client.url);
  },
  assetIndex(assetIndex: ClientJsonAssetIndex): string {
    return this._transferHost(assetIndex.url);
  },
  assetObject(startHash: string, hash: string): string {
    switch (this._provider) {
      case "bmclapi":
        return `https://bmclapi2.bangbang93.com/assets/${startHash}/${hash}`;
      case "mcbbs":
        return `https://download.mcbbs.net/assets/${startHash}/${hash}`;
      default:
        return `https://resources.download.minecraft.net/${startHash}/${hash}`;
    }
  },
  authlibInjector(): string {
    switch (this._provider) {
      case "bmclapi":
        return "https://bmclapi2.bangbang93.com/mirrors/authlib-injector/artifact/35/authlib-injector-1.1.35.jar";
      case "mcbbs":
        return "https://download.mcbbs.net/mirrors/authlib-injector/artifact/35/authlib-injector-1.1.35.jar";
      default:
        return "https://authlib-injector.yushi.moe/artifact/35/authlib-injector-1.1.35.jar";
    }
  },
  library(source: string): string {
    if (this._provider === "official") return source;
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
    switch (this._provider) {
      case "mcbbs":
        return bmclapi.replace("bmclapi2.bangbang93.com", "download.mcbbs.net");
      default:
        return bmclapi;
    }
  },
  LiteLoader: {
    versions(): string {
      switch (MinecraftUrlUtils._provider) {
        case "bmclapi":
          return "https://bmclapi.bangbang93.com/maven/com/mumfrey/liteloader/versions.json";
        case "mcbbs":
          return "https://download.mcbbs.net/maven/com/mumfrey/liteloader/versions.json";
        default:
          return "https://dl.liteloader.com/versions/versions.json";
      }
    },
  },
  Fabric: {
    loaders(): string {
      return `${this.meta()}/v2/versions/loader`;
    },
    games(): string {
      return `${this.meta()}/v2/versions/game`;
    },
    json(mc: string, loader: string): string {
      return `${this.meta()}/v2/versions/loader/${mc}/${loader}/profile/json`;
    },
    maven(): string {
      switch (MinecraftUrlUtils._provider) {
        case "bmclapi":
          return "https://download.mcbbs.net/maven";
        case "mcbbs":
          return "https://bmclapi2.bangbang93.com/maven";
        default:
          return "https://maven.fabricmc.net";
      }
    },
    meta(): string {
      // bmclapi or mcbbs support is not available
      return "https://meta.fabricmc.net";
    },
  },
  Forge: {},
  Optifine: {},
};

export function replaceHost(source: string, host: string): string {
  const url = new URL(source);
  url.host = host;
  return url.href;
}
