import { ephConfigs, setConfig } from "./config";
import { logger } from "../renderer/global";

export interface MinecraftProfile {
  name: string;
  dir: string;
  ver: string;
  from?: "create" | "download";
  jvmArgs?: string;
  resolution?: [number, number];
}

export type MinecraftProfileEditablePart = Omit<MinecraftProfile, "from">;

export function createProfile({
  name,
  dir,
  ver,
  from,
}: MinecraftProfile): boolean {
  if (name === "" || dir === "" || ver === "") return false;
  setConfig(() =>
    ephConfigs.profiles.push({
      name,
      dir,
      ver,
      from,
    })
  );
  logger.info(`Created profile named '${name}'`);
  return true;
}

export function editProfile(
  former: MinecraftProfile,
  profile: MinecraftProfileEditablePart
): boolean {
  setConfig(() => Object.assign(former, profile));
  logger.info(`Update profile`);
  return true;
}

export function removeProfile(profile: MinecraftProfile): void {
  setConfig((cfg) => cfg.profiles.remove(profile));
  logger.info(`Removed profile.`);
}
