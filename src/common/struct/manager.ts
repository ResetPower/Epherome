import { MinecraftProfile } from "./profiles";
import path from "path";
import fs from "fs";
import { shortid } from "../utils/ids";
import { action, makeObservable, observable } from "mobx";
import { ipcRenderer } from "electron";
import { basenameWithoutExt, readdir } from "common/utils/files";
import { apply } from "common/utils";

export interface MinecraftSave {
  id: number;
  name: string;
  path: string;
}

export type MinecraftResourcePackType = "resourcePack" | "shaderPack";

export interface MinecraftResourcePack {
  id: number;
  type: MinecraftResourcePackType;
  name: string;
  path: string;
}

export interface MinecraftMod {
  id: number;
  name: string;
  path: string;
  enabled: boolean;
}

export type MinecraftGameOptions = {
  key: string;
  value: string;
}[];

export class MinecraftProfileManagerStore {
  profile: MinecraftProfile;
  gameDir: string;
  savesPath: string;
  resourcePacksPath: string;
  shaderPacksPath: string;
  optionsTxtPath: string;
  modsPath: string;
  @observable
  saves: MinecraftSave[] = [];
  @observable
  resourcePacks: MinecraftResourcePack[] = [];
  @observable
  mods: MinecraftMod[] = [];
  @observable
  options: MinecraftGameOptions | null = null;
  @observable
  selections = {
    save: -1,
    resourcePack: -1,
    mod: -1,
  };
  constructor(profile: MinecraftProfile) {
    this.profile = profile;
    this.gameDir = this.profile.gameDirIsolation
      ? path.join(this.profile.dir, "versions", this.profile.ver)
      : this.profile.dir;
    this.savesPath = path.join(this.gameDir, "saves");
    this.resourcePacksPath = path.join(this.gameDir, "resourcepacks");
    this.shaderPacksPath = path.join(this.gameDir, "shaderpacks");
    this.modsPath = path.join(this.gameDir, "mods");
    this.optionsTxtPath = path.join(this.gameDir, "options.txt");
    this.refresh();
    makeObservable(this);
  }
  @action
  readOptions = (): void => {
    if (fs.existsSync(this.optionsTxtPath)) {
      const read = fs
        .readFileSync(this.optionsTxtPath)
        .toString()
        .split("\n")
        .map((v) => v.split(":"));
      const temp: MinecraftGameOptions = [];
      for (const [key, value] of read) {
        key &&
          value &&
          temp.push({
            key,
            value,
          });
      }
      this.options = temp;
    }
  };
  @action
  saveOptions = (editions: Record<string, string | undefined>): void => {
    for (const [key, value] of Object.entries(editions)) {
      value &&
        apply(
          this.options?.find((v) => v.key === key),
          (v) => (v.value = value)
        );
    }
    this.options &&
      fs.writeFileSync(
        this.optionsTxtPath,
        this.options.map((value) => `${value.key}:${value.value}`).join("\n")
      );
  };
  @action
  importMod = (): void => {
    ipcRenderer.invoke("import-mod").then((value) => {
      value &&
        fs.copyFileSync(value, path.join(this.modsPath, path.basename(value)));
      this.refresh();
    });
  };
  @action
  enableMod = (id: number): void => {
    const mod = this.mods.find((val) => val.id === id);
    if (mod && !mod.enabled && mod.path.endsWith(".disabled")) {
      mod.enabled = true;
      const newPath = mod.path.substring(0, mod.path.length - 9);
      fs.renameSync(mod.path, newPath);
      mod.path = newPath;
    }
  };
  @action
  disableMod = (id: number): void => {
    const mod = this.mods.find((val) => val.id === id);
    if (mod && mod.enabled && !mod.path.endsWith(".disabled")) {
      mod.enabled = false;
      const newPath = `${mod.path}.disabled`;
      fs.renameSync(mod.path, newPath);
      mod.path = newPath;
    }
  };
  @action
  select = (type: "save" | "resourcePack" | "mod", value: number): void => {
    this.selections = { ...this.selections, [type]: value };
  };
  @action
  refresh = (): void => {
    try {
      this.saves = readdir(this.savesPath, "folder").map((val) => ({
        id: shortid(),
        name: basenameWithoutExt(val),
        path: path.join(this.savesPath, val),
      }));
      this.resourcePacks = [
        ...readdir(
          this.resourcePacksPath,
          "folder",
          "zip"
        ).map<MinecraftResourcePack>((val) => ({
          id: shortid(),
          type: "resourcePack",
          name: basenameWithoutExt(val),
          path: path.join(this.resourcePacksPath, val),
        })),
        ...readdir(
          this.shaderPacksPath,
          "folder",
          "zip"
        ).map<MinecraftResourcePack>((val) => ({
          id: shortid(),
          type: "shaderPack",
          name: basenameWithoutExt(val),
          path: path.join(this.shaderPacksPath, val),
        })),
      ];
      this.mods = readdir(this.modsPath, "modFile").map((val) => ({
        id: shortid(),
        name: basenameWithoutExt(val),
        path: path.join(this.modsPath, val),
        enabled: !val.endsWith(".disabled"),
      }));
    } catch {
      this.saves = this.resourcePacks = this.mods = [];
    }
  };
}
