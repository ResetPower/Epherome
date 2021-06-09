import { RequestInit } from "node-fetch";
import { ipcRenderer } from "electron";
import { EphResponse } from "./types";

export function ephFetch(url: string, opts: RequestInit = {}): Promise<EphResponse> {
  return ipcRenderer.invoke("http", [url, opts]);
}
