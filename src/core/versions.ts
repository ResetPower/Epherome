export type MinecraftVersionType =
  | "release"
  | "snapshot"
  | "old_beta"
  | "old_alpha";

export interface MinecraftVersionManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MinecraftVersion[];
}

export interface MinecraftVersion {
  id: string;
  type: MinecraftVersionType;
  url: string;
  time: string;
  releaseTime: string;
}

export interface MinecraftVersionDetail {
  match: boolean;
  major: number;
  minor: number;
  patch: number;
  id: string;
}

// From Minecraft 1.18, Java 17 is required to run minecraft
export function isJava17Required(detail: MinecraftVersionDetail): boolean {
  return detail.match && detail.major >= 1 && detail.minor >= 18;
}

// From Minecraft 1.17, Java 16 is required to run minecraft
export function isJava16Required(detail: MinecraftVersionDetail): boolean {
  return detail.match && detail.major >= 1 && detail.minor >= 17;
}

// Before Minecraft 1.6 (exclude), Java 8 is required to run minecraft
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
