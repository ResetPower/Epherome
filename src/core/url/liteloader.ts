import { MinecraftDownloadProvider } from ".";

const liteloaderUrlUtil = (provider: MinecraftDownloadProvider) => ({
  versions(): string {
    switch (provider) {
      case "bmclapi":
        return "https://bmclapi.bangbang93.com/maven/com/mumfrey/liteloader/versions.json";
      case "mcbbs":
        return "https://download.mcbbs.net/maven/com/mumfrey/liteloader/versions.json";
      default:
        return "https://dl.liteloader.com/versions/versions.json";
    }
  },
});

export default liteloaderUrlUtil;
