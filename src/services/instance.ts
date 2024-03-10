import { fs, path } from "@tauri-apps/api";
import { MinecraftInstance } from "../stores/struct";
import { readTextFile } from "@tauri-apps/api/fs";

export interface MinecraftResource {
  path: string;
  dir: boolean;
  name: string;
}

export interface MinecraftInstancePaths {
  savesDir: string;
  resourcePacksDir: string;
  modsDir: string;
  optionsFile: string;
}

export class InstanceService {
  instance: MinecraftInstance;
  saves: MinecraftResource[] = [];
  resourcepacks: MinecraftResource[] = [];
  mods: MinecraftResource[] = [];
  gameOptions: [string, string][] = [];
  dirs?: MinecraftInstancePaths;
  state: MinecraftResource | number = 0;
  constructor(instance: MinecraftInstance) {
    this.instance = instance;
    this.fetchData().then().catch;
  }
  private async toResourceList(dir: string): Promise<MinecraftResource[]> {
    return (await fs.readDir(dir))
      .filter((fe) => fe.name && fe.name !== ".DS_Store")
      .map((fe) => ({ name: fe.name!, path: fe.path, dir: !!fe.children }));
  }
  async fetchData() {
    this.dirs = {
      savesDir: await path.join(this.instance.gameDir, "saves"),
      resourcePacksDir: await path.join(this.instance.gameDir, "resourcepacks"),
      modsDir: await path.join(this.instance.gameDir, "mods"),
      optionsFile: await path.join(this.instance.gameDir, "options.txt"),
    };
    this.saves = await this.toResourceList(this.dirs.savesDir);
    this.resourcepacks = await this.toResourceList(this.dirs.resourcePacksDir);
    this.mods = await this.toResourceList(this.dirs.modsDir);
    this.gameOptions = (await readTextFile(this.dirs.optionsFile))
      .split("\n")
      .filter((x) => x) // exclude empty lines
      .map((set) => set.split(":")) as [string, string][];
  }
  select(resource: MinecraftResource) {
    this.state = resource;
    this.emitChange();
  }
  selected(resource: MinecraftResource) {
    return this.state === resource;
  }
  async refresh() {
    await this.fetchData();
    if (typeof this.state === "number") this.state++;
    else this.state = 0;
    this.emitChange();
  }

  listeners: (() => void)[] = [];
  emitChange() {
    for (const fn of this.listeners) {
      fn();
    }
  }
  subscribe = (listener: () => void) => {
    this.listeners.push(listener);
    return () =>
      (this.listeners = this.listeners.filter((l) => l !== listener));
  };
  getSnapshot = () => this.state;
}
