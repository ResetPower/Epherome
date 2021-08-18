import { ChildProcessWithoutNullStreams } from "child_process";
import { call, DefaultFn } from "../tools";
import { MinecraftProfile } from "./profiles";

export type ProcessOutputListener = (chunk: string) => unknown;

export interface ProcessListenerMap {
  output: ProcessOutputListener;
  exit: DefaultFn;
}

export class Process {
  profile: MinecraftProfile;
  done = false;
  raw: ChildProcessWithoutNullStreams;
  outputs: string[] = [];
  onOutput?: ProcessListenerMap["output"];
  onExit?: ProcessListenerMap["exit"];
  constructor(profile: MinecraftProfile, raw: ChildProcessWithoutNullStreams) {
    this.profile = profile;
    this.raw = raw;
    this.onExit && raw.on("exit", this.onExit);
    raw.stdout.on("data", (d) => this.output(d.toString()));
    raw.stderr.on("data", (d) => this.output(d.toString()));
  }
  output(chunk: string): void {
    call(this.onOutput, chunk);
  }
}
