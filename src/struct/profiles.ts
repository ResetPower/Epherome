import { getById, getNextId, WithId } from "../tools";
import { ephConfigs, setConfig } from "../renderer/config";
import { logger } from "../renderer/global";

export interface MinecraftProfile extends WithId {
  name: string;
  dir: string;
  ver: string;
}

export function createProfile(name: string, dir: string, ver: string): boolean {
  const theId = getNextId(ephConfigs.profiles);
  setConfig(() =>
    ephConfigs.profiles.push({
      id: theId,
      name,
      dir,
      ver,
    })
  );
  logger.info(`Created profile named '${name}', id: ${theId}`);
  return true;
}

export function editProfile(id: number, name: string, dir: string, ver: string): boolean {
  setConfig(
    () =>
      (ephConfigs.profiles = ephConfigs.profiles.map((value: MinecraftProfile) => {
        return value.id === id ? { id, name, dir, ver } : value;
      }))
  );
  logger.info(`Update profile, id: ${id}`);
  return true;
}

export function removeProfile(id: number): void {
  setConfig(() => (ephConfigs.profiles = ephConfigs.profiles.filter((value) => value.id !== id)));
  logger.info(`Removed profile, id: ${id}`);
}

export function getProfile(id: number): MinecraftProfile | null {
  return getById(ephConfigs.profiles, id);
}
