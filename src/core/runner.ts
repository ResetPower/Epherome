import { spawn } from "child_process";
import { coreLogger } from ".";
import { MinecraftProfile } from "../struct/profiles";
import { DefaultFn } from "../tools";
import { processStore } from "../views/ProcessesPage";

export function runMinecraft(
  java: string,
  buff: string[],
  dir: string,
  onDone: DefaultFn,
  profile: MinecraftProfile
): void {
  let done = false;
  const raw = spawn(java, ["-Dfile.encoding=UTF-8", ...buff], {
    cwd: dir,
  });
  raw.stdout.setEncoding("utf8");
  raw.stderr.setEncoding("utf8");
  raw.stdout.on(
    "data",
    () =>
      !done &&
      (done = true) &&
      (() => {
        onDone();
        coreLogger.info("Minecraft is running");
      })()
  );
  raw.on("exit", () => {
    !done && onDone();
  });
  processStore.register(profile, raw);
}
