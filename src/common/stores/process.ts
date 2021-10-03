import { ChildProcessWithoutNullStreams } from "child_process";
import { MinecraftProfile } from "common/struct/profiles";
import { action, makeObservable, observable, runInAction } from "mobx";
import fs from "fs";
import { logFilename } from "common/struct/config";
import { _ } from "common/utils/arrays";
import { shortid } from "common/utils/ids";

export class Process {
  id: number;
  profile: MinecraftProfile;
  raw: ChildProcessWithoutNullStreams;
  outputs: string[] = [];
  done = false;
  crash = false;
  crashReport: string[] = [];
  constructor(profile: MinecraftProfile, raw: ChildProcessWithoutNullStreams) {
    this.profile = profile;
    this.raw = raw;
    this.id = shortid();
  }
}

export class ProcessStore {
  @observable
  messages = "";
  @observable
  processes: Process[] = [];
  @observable
  value = -1;
  constructor() {
    makeObservable(this);
    fs.watch(logFilename, { encoding: "utf-8" }, () => {
      const newMessages = fs.readFileSync(logFilename).toString();
      runInAction(() => (this.messages = newMessages));
    });
  }
  done(id: number): void {
    this.modify(id, (proc) => {
      proc.done = true;
      return { ...proc };
    });
  }
  output(id: number, chunk: string): void {
    this.modify(id, (proc) => {
      proc.outputs.push(chunk);
      return { ...proc };
    });
  }
  @action
  register(process: Process): void {
    this.processes.push(process);
    const id = process.id;
    process.raw.on("exit", () => this.done(id));
    [process.raw.stdout, process.raw.stderr].forEach((i) =>
      i.on("data", (chunk) => this.output(id, chunk))
    );
  }
  @action
  remove(process: Process): void {
    for (const k in this.processes) {
      if (this.processes[k] === process) {
        this.processes.splice(+k, 1);
        if (this.processes[this.value] === undefined) {
          this.select(-1);
        }
        break;
      }
    }
  }
  @action
  modify(id: number, modifier: (source: Process) => Process): void {
    for (const k in this.processes) {
      const v = this.processes[+k];
      if (v.id === id) {
        this.processes[+k] = modifier(v);
      }
    }
  }
  @action
  select(value: number): void {
    this.value = value;
  }
}

export const processStore = new ProcessStore();
