import { shell } from "electron";
import fs from "fs";

export function openInBrowser(url: string): void {
  shell.openExternal(url);
}

export function openItemInFinder(path: string): void {
  shell.showItemInFolder(path);
}

export function openInFinder(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  shell.openPath(path);
}
