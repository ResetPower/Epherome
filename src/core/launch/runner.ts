import { spawn } from "child_process";
import { coreLogger } from "common/loggers";
import { MinecraftProfile } from "common/struct/profiles";
import { Process, processStore } from "common/stores/process";
import { LaunchOnDone } from ".";

export function runMinecraft(
  java: string,
  buff: string[],
  dir: string,
  onDone: LaunchOnDone,
  profile: MinecraftProfile
): void {
  let done = false;
  const raw = spawn(java, ["-Dfile.encoding=UTF-8", ...buff], {
    cwd: dir,
    detached: true,
  });
  raw.stdout.setEncoding("utf8");
  raw.stderr.setEncoding("utf8");
  const proc = new Process(profile, raw);
  processStore.register(proc);
  raw.stdout.on("data", () => {
    if (!done) {
      done = true;
      onDone(proc);
      coreLogger.info("Minecraft is running");
    }
  });
  raw.stderr.on("data", (chunk) => {
    if (!proc.crash) {
      !proc.crash && (proc.crash = true);
      proc.crashReport.push(chunk.toString());
    }
  });
  raw.on("exit", () => {
    !done && onDone(proc);
  });
}
