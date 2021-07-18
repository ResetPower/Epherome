export type MinecraftVersionType = "release" | "snapshot" | "old_beta" | "old_alpha";

export interface MinecraftVersion {
  id: string;
  type: MinecraftVersionType;
  url: string;
}

export interface MinecraftVersionDetail {
  major: number;
  minor: number;
  patch: number;
  other: string;
  vanilla: boolean;
}

// From Minecraft 1.17, Java 16 is required to run minecraft
// Make this judgment to prompt the user to install Java 16 if not
export function isJava16Required(detail: MinecraftVersionDetail): boolean {
  return detail.major >= 1 && detail.minor >= 17;
}

export function parseMinecraftVersionDetail(id: string): MinecraftVersionDetail {
  const split = id.split("-");
  const split1 = split[0].split(".");
  const vanilla = split.length === 1;
  return {
    major: parseInt(split1[0]),
    minor: parseInt(split1[1]),
    patch: parseInt(split1[2]),
    other: vanilla ? "" : split.slice(1, split.length).join("-"),
    vanilla,
  };
}
