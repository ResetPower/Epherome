import { getById, getNextId, WithId } from "../tools/arrays";
import { readConfig, writeConfig } from "./config";

export interface MinecraftProfile extends WithId {
  name: string;
  dir: string;
  ver: string;
}

export function createProfile(name: string, dir: string, ver: string): boolean {
  const array = readConfig("profiles", []);
  writeConfig<MinecraftProfile[]>(
    "profiles",
    [
      ...array,
      {
        id: getNextId(array),
        name,
        dir,
        ver,
      },
    ],
    true
  );
  return true;
}

export function editProfile(id: number, name: string, dir: string, ver: string): boolean {
  const array = readConfig("profiles", []);
  writeConfig<MinecraftProfile[]>(
    "profiles",
    array.map((value: MinecraftProfile) => {
      return value.id === id ? { id, name, dir, ver } : value;
    }),
    true
  );
  return true;
}

export function removeProfile(id: number): void {
  writeConfig(
    "profiles",
    readConfig<MinecraftProfile[]>("profiles", []).filter((value) => value.id !== id),
    true
  );
}

export function getProfile(id: number): MinecraftProfile | null {
  return getById(readConfig("profiles", []), id);
}
