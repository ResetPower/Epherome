import { setConfig } from "./config";
import { WithUnderline, _ } from "common/utils/arrays";
import { commonLogger } from "common/loggers";

export interface MinecraftResolution {
  width?: number;
  height?: number;
}

export type MinecraftProfileType = "create" | "download" | "import" | "folder";

export interface MinecraftProfileModpackInfo {
  name: string;
  version: string;
  author: string;
}

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
  modpackInfo?: MinecraftProfileModpackInfo;
  realVer?: string;
  // only available when this.from = "folder";
  parent?: MinecraftProfileFolder;
}

export type ChildProfile = Omit<
  MinecraftProfile,
  "from" | "name" | "dir" | "ver" | "parent"
>;

export type MinecraftProfileEditablePart = Omit<MinecraftProfile, "from">;

export function createProfile(profile: MinecraftProfile): boolean {
  if (profile.name === "" || profile.dir === "" || profile.ver === "")
    return false;
  setConfig((cfg) => cfg.profiles.push(profile));
  commonLogger.info(`Created profile named '${profile.name}'`);
  return true;
}

function castMinecraftProfileToChildProfile(
  prof: MinecraftProfile
): ChildProfile {
  const temp: Partial<MinecraftProfile> = prof;
  temp.name = undefined;
  temp.dir = undefined;
  temp.ver = undefined;
  temp.from = undefined;
  temp.parent = undefined;
  return temp;
}

export function editProfile(
  former: MinecraftProfile,
  profile: MinecraftProfileEditablePart
): boolean {
  setConfig(() => {
    const merged = { ...former, ...profile };
    if (former.parent) {
      former.parent.children[former.ver] =
        castMinecraftProfileToChildProfile(merged);
    } else {
      Object.assign(former, merged);
    }
  });
  commonLogger.info(`Updated profile`);
  return true;
}

export function removeProfile(profile: MinecraftProfile): void {
  setConfig((cfg) => _.remove(cfg.profiles, profile));
  commonLogger.info(`Removed profile`);
}

export interface MinecraftProfileFolder extends WithUnderline {
  pathname: string;
  nickname: string;
  selectedChild?: string;
  children: { [key: string]: ChildProfile };
}
