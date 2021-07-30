import { DefaultFn } from "../tools/types";
import { MinecraftProfile } from "./profiles";

export class ProcessesService {
  static processes: Process[] = [];
  static registerProcess(process: Process): void {
    this.processes.push(process);
  }
}

export type ProcessAction = "output";

export class Process {
  profile: MinecraftProfile;
  outputs: string[] = [];
  private onOutput?: DefaultFn;

  constructor(profile: MinecraftProfile) {
    this.profile = profile;
  }
  on(action: ProcessAction, fn: DefaultFn): void {
    action === "output" && (this.onOutput = fn);
  }
  clearListeners(action: ProcessAction): void {
    action === "output" && (this.onOutput = undefined);
  }
  output(chunk: string): void {
    this.outputs.push(chunk);
    this.onOutput && this.onOutput();
  }
}
