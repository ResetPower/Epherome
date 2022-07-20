import fs from "fs";
import path from "path";

export type MinecraftVersionType =
  | "release"
  | "snapshot"
  | "old_beta"
  | "old_alpha";

export interface MinecraftVersion {
  id: string;
  type: MinecraftVersionType;
  url: string;
}

export interface MinecraftVersionDetail {
  match: boolean;
  major: number;
  minor: number;
  patch: number;
  id: string;
}

// From Minecraft 1.18, Java 17 is required to run minecraft
// Make this judgment to prompt the user to use Java 17 if not
export function isJava17Required(detail: MinecraftVersionDetail): boolean {
  return detail.match && detail.major >= 1 && detail.minor >= 18;
}

// From Minecraft 1.17, Java 16 is required to run minecraft
// Make this judgment to prompt the user to use Java 16 if not
export function isJava16Required(detail: MinecraftVersionDetail): boolean {
  return detail.match && detail.major >= 1 && detail.minor >= 17;
}

// Before Minecraft 1.6 (exclude), Java 8 is required to run minecraft
// Make this judgment to prompt the user to use Java 8 if not
export function isJava8Required(detail: MinecraftVersionDetail): boolean {
  return detail.match && detail.major <= 1 && detail.minor <= 5;
}

export function parseMinecraftVersionDetail(
  id: string
): MinecraftVersionDetail {
  const regex = /([0-9]+)\.([0-9]+)\.?([0-9]+)?/;
  const fallback = [0, NaN, NaN, NaN];
  const matched = id.match(regex);
  return {
    match: !!matched,
    major: +(matched ?? fallback)[1],
    minor: +(matched ?? fallback)[2],
    patch: +(matched ?? fallback)[3],
    id,
  };
}

export function searchVersions(dir: string): string[] {
  const versions = path.join(dir, "versions");
  return fs.readdirSync(versions).filter((value) => value !== ".DS_Store");
}
