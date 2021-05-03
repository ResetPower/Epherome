import { getNextId, WithId } from "../tools/arrays";
import { authenticate, genOfflineToken, genUUID } from "../tools/auth";
import { readConfig, writeConfig } from "./config";

export interface MinecraftAccount extends WithId {
  email: string;
  name: string;
  uuid: string;
  token: string;
  mode: "mojang" | "microsoft" | "authlib" | "offline";
}

export async function createAccount(
  mode: string,
  username: string,
  password: string,
  authserver: string
): Promise<boolean> {
  const array = readConfig("accounts", []);
  const appendAccount = (account: MinecraftAccount) => {
    writeConfig<MinecraftAccount[]>("accounts", [...array, account], true);
  };
  if (mode === "mojang") {
    if (username === "" || password === "") return false;
    const result = await authenticate(username, password);
    if (result.err) {
      return false;
    } else {
      appendAccount({
        id: getNextId(array),
        email: username,
        name: result.name,
        uuid: result.uuid,
        token: result.token,
        mode: "mojang",
      });
      return true;
    }
  } else if (mode === "microsoft") {
    return true;
  } else if (mode === "authlib") {
    if (username === "" || password === "" || authserver === "") return false;
    const result = await authenticate(username, password, authserver + "/authserver");
    if (result.err) {
      return false;
    } else {
      appendAccount({
        id: getNextId(array),
        email: username,
        name: result.name,
        uuid: result.uuid,
        token: result.token,
        mode: "authlib",
      });
      return true;
    }
  } else {
    if (username === "") return false;
    appendAccount({
      id: getNextId(array),
      email: "",
      name: username,
      uuid: genUUID(),
      token: genOfflineToken(username),
      mode: "offline",
    });
    return true;
  }
}

export function removeAccount(id: number): void {
  writeConfig(
    "accounts",
    readConfig<MinecraftAccount[]>("accounts", []).filter((value) => value.id !== id),
    true
  );
}

export function updateAccountToken(id: number, newToken: string): void {
  writeConfig(
    "accounts",
    readConfig<MinecraftAccount[]>("accounts", []).map((value) => {
      if (value.id === id) {
        value.token = newToken;
        return value;
      } else {
        return value;
      }
    }),
    true
  );
}
