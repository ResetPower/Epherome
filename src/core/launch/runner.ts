import { invoke } from "@tauri-apps/api";

export async function runMinecraft(
  java: string,
  buff: string[],
  dir: string
): Promise<void> {
  await invoke("run_minecraft", { pwd: dir, java, args: buff });
}
