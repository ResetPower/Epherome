import { getNextId, WithId } from "../tools/arrays";
import { authenticate, genOfflineToken, genUUID } from "../tools/auth";
import { ephConfigs, setConfig } from "./config";

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
  const array = ephConfigs.accounts;
  const appendAccount = (account: MinecraftAccount) => {
    setConfig(() => ephConfigs.accounts.push(account));
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
  setConfig(() => (ephConfigs.accounts = ephConfigs.accounts.filter((value) => value.id !== id)));
}

export function updateAccountToken(id: number, newToken: string): void {
  setConfig(
    () =>
      (ephConfigs.accounts = ephConfigs.accounts.map((value) => {
        if (value.id === id) {
          value.token = newToken;
          return value;
        } else {
          return value;
        }
      }))
  );
}
