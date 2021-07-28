import { ipcRenderer } from "electron";
import {
  authCode2AuthToken,
  authenticate,
  authToken2XBLToken,
  checkMinecraftOwnership,
  genOfflineToken,
  genUUID,
  getMicrosoftMinecraftProfile,
  XBLToken2XSTSToken,
  XSTSToken2MinecraftToken,
} from "../tools/auth";
import { ephConfigs, setConfig } from "./config";
import { logger } from "../renderer/global";

export interface MinecraftAccount {
  email: string;
  name: string;
  uuid: string;
  token: string;
  authserver?: string;
  mode: "mojang" | "microsoft" | "authlib" | "offline";
}

export interface CreateAccountImplResult {
  success: boolean;
  message?: "msAccNoMinecraft" | "";
}

function appendAccount(account: MinecraftAccount) {
  setConfig(() => ephConfigs.accounts.push(account));
  logger.info(`Created new ${account.mode} account`);
}

export async function createAccount(
  mode: string,
  username: string,
  password: string,
  authserver: string
): Promise<CreateAccountImplResult> {
  const unsuccessfulResult: CreateAccountImplResult = { success: false };
  const successfulResult: CreateAccountImplResult = { success: true };
  if (mode === "mojang") {
    if (username === "" || password === "") return unsuccessfulResult;
    const result = await authenticate(username, password);
    if (result.err) {
      return unsuccessfulResult;
    } else {
      appendAccount({
        email: username,
        name: result.name,
        uuid: result.uuid,
        token: result.token,
        mode: "mojang",
      });
      return successfulResult;
    }
  } else if (mode === "microsoft") {
    // Microsoft OAuth Flow
    const result = await ipcRenderer.invoke("ms-auth");
    const split = result.split("&");
    let authCode = "";
    for (const i of split) {
      const j = i.split("=");
      if (j[0] === "code") {
        authCode = j[1];
      }
    }
    if (authCode === "") {
      // unusable auth code
      throw new Error("Unable to get auth code at microsoft authenticating");
    }

    // Authorization Code -> Authorization Token
    const authTokenResult = await authCode2AuthToken(authCode);
    const authToken = authTokenResult.access_token;
    if (authTokenResult.err || !authToken) {
      // unable to get auth token
      throw new Error("Unable to get auth token at microsoft authenticating");
    }

    // Authorization Token -> XBL Token
    const XBLTokenResult = await authToken2XBLToken(authToken);
    const XBLToken = XBLTokenResult.Token;
    if (XBLTokenResult.err || !XBLToken) {
      // unable to get xbl token
      throw new Error("Unable to get XBL token at microsoft authenticating");
    }

    // XBL Token -> XSTS Token
    const XSTSTokenResult = await XBLToken2XSTSToken(XBLToken);
    const XSTSToken = XSTSTokenResult.Token;
    const XSTSTokenUhs = XSTSTokenResult.DisplayClaims?.xui[0].uhs;
    if (XSTSTokenResult.err || !XSTSToken || !XSTSTokenUhs) {
      // unable to get xsts token
      throw new Error("Unable to XSTS auth token at microsoft authenticating");
    }

    // XSTS Token -> Minecraft Token
    const minecraftTokenResult = await XSTSToken2MinecraftToken(
      XSTSToken,
      XSTSTokenUhs
    );
    const minecraftToken = minecraftTokenResult.access_token;
    if (minecraftTokenResult.err || !minecraftToken) {
      // unable to get minecraft token
      throw new Error("Unable to get Minecraft token");
    }

    // Check Minecraft Ownership
    const ownership = await checkMinecraftOwnership(minecraftToken);
    const len = ownership.items?.length;
    if (len && len > 0) {
      // Get minecraft profile
      const prof = await getMicrosoftMinecraftProfile(minecraftToken);
      const uuid = prof.id;
      const name = prof.name;
      if (prof.err || !uuid || !name) {
        throw new Error("Unable to get Minecraft profile");
      } else {
        appendAccount({
          email: username,
          name,
          uuid,
          token: minecraftToken,
          mode: "microsoft",
        });
        return successfulResult;
      }
    } else {
      return { success: false, message: "msAccNoMinecraft" };
    }
  } else if (mode === "authlib") {
    if (username === "" || password === "" || authserver === "")
      return unsuccessfulResult;
    const server = authserver + "/authserver";
    const result = await authenticate(username, password, server);
    if (result.err) {
      return unsuccessfulResult;
    } else {
      appendAccount({
        email: username,
        name: result.name,
        uuid: result.uuid,
        token: result.token,
        authserver: server,
        mode: "authlib",
      });
      return successfulResult;
    }
  } else {
    // offline account
    if (username === "") return unsuccessfulResult;
    appendAccount({
      email: "",
      name: username,
      uuid: genUUID(),
      token: genOfflineToken(username),
      mode: "offline",
    });
    return successfulResult;
  }
}

export function removeAccount(account: MinecraftAccount): void {
  setConfig(() => ephConfigs.accounts.remove(account));
  logger.info(`Removed account`);
}

export function updateAccountToken(
  account: MinecraftAccount,
  newToken: string
): void {
  setConfig(() =>
    ephConfigs.accounts.forEach((value) => {
      value === account && (value.token = newToken);
    })
  );
  logger.info(`Updated account access token`);
}
