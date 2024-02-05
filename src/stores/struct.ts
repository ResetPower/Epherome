export type MinecraftAccountType = "microsoft" | "authlib" | "offline";

export interface MinecraftAccount {
  uuid: string;
  name: string;
  type: MinecraftAccountType;
  authserver?: string;
  token?: string;
}

export interface MinecraftProfile {
  name: string;
  gameDir: string;
  version?: string;
  isFolder: boolean;
}
