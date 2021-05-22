import { getById, getNextId, WithId } from "../tools/arrays";
import { ephConfigs, setConfig } from "./config";

export interface MinecraftProfile extends WithId {
  name: string;
  dir: string;
  ver: string;
}

export function createProfile(name: string, dir: string, ver: string): boolean {
  setConfig(() =>
    ephConfigs.profiles.push({
      id: getNextId(ephConfigs.profiles),
      name,
      dir,
      ver,
    })
  );
  return true;
}

export function editProfile(id: number, name: string, dir: string, ver: string): boolean {
  setConfig(
    () =>
      (ephConfigs.profiles = ephConfigs.profiles.map((value: MinecraftProfile) => {
        return value.id === id ? { id, name, dir, ver } : value;
      }))
  );
  return true;
}

export function removeProfile(id: number): void {
  setConfig(() => (ephConfigs.profiles = ephConfigs.profiles.filter((value) => value.id !== id)));
}

export function getProfile(id: number): MinecraftProfile | null {
  return getById(ephConfigs.profiles, id);
}
