import { MinecraftProfile } from "./profiles";
import path from "path";
import fs from "fs";
import { basenameWithoutExt, readdir } from "common/utils/files";
import { shortid } from "common/utils/ids";
import { action, makeObservable, observable } from "mobx";
import { ipcRenderer } from "electron";

export interface MinecraftSave {
  id: string;
  name: string;
  path: string;
}

export type MinecraftResourcePackType = "resourcePack" | "shaderPack";

export interface MinecraftResourcePack {
  id: string;
  type: MinecraftResourcePackType;
  name: string;
  path: string;
}

export interface MinecraftMod {
  id: string;
  name: string;
  path: string;
  enabled: boolean;
}

export class MinecraftProfileManagerStore {
  profile: MinecraftProfile;
  gameDir: string;
  savesPath: string;
  resourcePacksPath: string;
  shaderPacksPath: string;
  modsPath: string;
  @observable
  saves: MinecraftSave[] = [];
  @observable
  resourcePacks: MinecraftResourcePack[] = [];
  @observable
  mods: MinecraftMod[] = [];
  @observable
  selections = {
    save: "",
    resourcePack: "",
    mod: "",
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
    this.refresh();
    makeObservable(this);
  }
  @action
  importMod = (): void => {
    ipcRenderer.invoke("import-mod").then((value) => {
      value &&
        fs.copyFileSync(value, path.join(this.modsPath, path.basename(value)));
      this.refresh();
    });
  };
  @action
  enableMod = (id: string): void => {
    const mod = this.mods.find((val) => val.id === id);
    if (mod && !mod.enabled && mod.path.endsWith(".disabled")) {
      mod.enabled = true;
      const newPath = mod.path.substring(0, mod.path.length - 9);
      fs.renameSync(mod.path, newPath);
      mod.path = newPath;
    }
  };
  @action
  disableMod = (id: string): void => {
    const mod = this.mods.find((val) => val.id === id);
    if (mod && mod.enabled && !mod.path.endsWith(".disabled")) {
      mod.enabled = false;
      const newPath = `${mod.path}.disabled`;
      fs.renameSync(mod.path, newPath);
      mod.path = newPath;
    }
  };
  @action
  select = (type: "save" | "resourcePack" | "mod", value: string): void => {
    this.selections = { ...this.selections, [type]: value };
  };
  @action
  refresh = (): void => {
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
  };
}
