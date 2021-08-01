import { spawn } from "child_process";
import { coreLogger } from ".";
import { Process } from "../struct/processes";
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
  // raw means raw process (nodejs process) while proc means wrapped process (epherome process)
  const raw = spawn(java, buff, {
    cwd: dir,
  });
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
  const proc = new Process(profile);
  raw.stdout.on("data", (d) => proc.output(d.toString()));
  raw.stderr.on("data", (d) => proc.output(d.toString()));
  processStore.register(proc);
}
