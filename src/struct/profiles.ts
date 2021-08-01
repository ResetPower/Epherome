import { configStore, setConfig } from "./config";
import { logger } from "../renderer/global";
import { WithSelected, _ } from "../tools/arrays";

export interface MinecraftProfile extends WithSelected {
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
    configStore.profiles.push({
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
  setConfig((cfg) => _.remove(cfg.profiles, profile));
  logger.info(`Removed profile.`);
}
