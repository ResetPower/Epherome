import { getById, getNextId, WithId } from "../tools";
import { ephConfigs, setConfig } from "./config";
import { logger } from "../renderer/global";

export interface MinecraftProfile extends WithId {
  name: string;
  dir: string;
  ver: string;
  from?: "create" | "download";
  jvmArgs?: string;
  resolution?: [number, number];
}

export type MinecraftProfileWithoutId = Omit<MinecraftProfile, "id">;
export type MinecraftProfileEditablePart = Omit<MinecraftProfileWithoutId, "from">;

export function createProfile({ name, dir, ver, from }: MinecraftProfileWithoutId): boolean {
  if (name === "" || dir === "" || ver === "") return false;
  const theId = getNextId(ephConfigs.profiles);
  setConfig(() =>
    ephConfigs.profiles.push({
      id: theId,
      name,
      dir,
      ver,
      from,
    })
  );
  logger.info(`Created profile named '${name}', id: ${theId}`);
  return true;
}

export function editProfile(id: number, profile: MinecraftProfileEditablePart): boolean {
  setConfig({
    profiles: ephConfigs.profiles.map((value: MinecraftProfile) => {
      return value.id === id ? Object.assign(value, profile) : value;
    }),
  });
  logger.info(`Update profile, id: ${id}`);
  return true;
}

export function removeProfile(id: number): void {
  setConfig({ profiles: ephConfigs.profiles.filter((value) => value.id !== id) });
  logger.info(`Removed profile, id: ${id}`);
}

export function getProfile(id: number): MinecraftProfile | null {
  return getById(ephConfigs.profiles, id);
}
