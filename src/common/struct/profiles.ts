import { setConfig } from "./config";
import { logger } from "eph/renderer/global";
import { WithUnderline, _ } from "common/utils/arrays";

export interface MinecraftResolution {
  width?: number;
  height?: number;
}

export type MinecraftProfileType = "create" | "download";

export interface MinecraftProfile extends WithUnderline {
  name: string;
  dir: string;
  ver: string;
  from?: MinecraftProfileType;
  jvmArgs?: string;
  resolution?: MinecraftResolution;
  // nanoid of selected java instance
  java?: string;
  gameDirIsolation?: boolean;
  showEpherome?: boolean;
}

export type MinecraftProfileEditablePart = Omit<MinecraftProfile, "from">;

export function createProfile(profile: MinecraftProfile): boolean {
  if (profile.name === "" || profile.dir === "" || profile.ver === "")
    return false;
  setConfig((cfg) => cfg.profiles.push(profile));
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
  setConfig((cfg) => _.remove(cfg.profiles, profile));
  logger.info(`Removed profile.`);
}
