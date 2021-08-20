import { MinecraftProfile } from "common/struct/profiles";
import { getFabricInstallVersions } from "./fabric";
import { getLiteLoaderInstallVersions } from "./liteloader";

export type MinecraftInstall = "Fabric" | "Forge" | "Optifine" | "LiteLoader";

export type Installer = (profile: MinecraftProfile) => Promise<void>;

export interface InstallVersion {
  name: string;
  install: Installer;
}

export async function getInstallVersions(
  mc: string,
  type: MinecraftInstall
): Promise<InstallVersion[]> {
  if (type === "Fabric") {
    return await getFabricInstallVersions(mc);
  } else if (type === "Forge") {
    return [];
  } else if (type === "Optifine") {
    return [];
  } else if (type === "LiteLoader") {
    return await getLiteLoaderInstallVersions(mc);
  } else {
    return [];
  }
}
