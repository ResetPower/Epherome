import { setConfig } from "./config";
import { WithUnderline, _ } from "common/utils/arrays";
import { commonLogger } from "common/loggers";

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
  safeLog4j?: boolean;
}

export type MinecraftProfileEditablePart = Omit<MinecraftProfile, "from">;

export function createProfile(profile: MinecraftProfile): boolean {
  if (profile.name === "" || profile.dir === "" || profile.ver === "")
    return false;
  setConfig((cfg) => cfg.profiles.push(profile));
  commonLogger.info(`Created profile named '${profile.name}'`);
  return true;
}

export function editProfile(
  former: MinecraftProfile,
  profile: MinecraftProfileEditablePart
): boolean {
  setConfig(() => Object.assign(former, profile));
  commonLogger.info(`Update profile`);
  return true;
}

export function removeProfile(profile: MinecraftProfile): void {
  setConfig((cfg) => _.remove(cfg.profiles, profile));
  commonLogger.info(`Removed profile.`);
}
