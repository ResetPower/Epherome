import { spawn } from "child_process";

export function runMinecraft(
  java: string,
  buff: string[],
  dir: string,
  onErr: (error: Error) => void,
  onDone: () => void
): void {
  let done = false;
  const proc = spawn(java, buff, {
    cwd: dir,
  });
  proc.on("error", onErr);
  proc.stdout.on("data", () => !done && (done = true) && onDone());
}
