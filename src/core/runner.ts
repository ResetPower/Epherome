import { spawn } from "child_process";
import { coreLogger } from ".";
import { DefaultFunction } from "../tools/types";

export function runMinecraft(
  java: string,
  buff: string[],
  dir: string,
  onErr: (error: Error) => void,
  onDone: DefaultFunction
): void {
  let done = false;
  const proc = spawn(java, buff, {
    cwd: dir,
  });
  proc.on("error", onErr);
  proc.stdout.on(
    "data",
    () =>
      !done &&
      (done = true) &&
      (() => {
        onDone();
        coreLogger.info("Minecraft is running");
      })()
  );
  if (process.env.NODE_ENV === "development") {
    // output process message to help developing
    // TODO Note that need to optimize more here
    proc.stdout.on("data", (d) => console.log(d.toString()));
    proc.stderr.on("data", (d) => console.log(d.toString()));
  }
}
