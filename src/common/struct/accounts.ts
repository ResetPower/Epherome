import {
  authCode2AuthToken,
  authToken2MinecraftTokenDirectly,
  checkMinecraftOwnership,
  getMicrosoftMinecraftProfile,
} from "core/auth/microsoft";
import { setConfig } from "./config";
import { WithUnderline, _ } from "common/utils/arrays";
import { commonLogger, rendererLogger } from "common/loggers";
import { ipcRenderer } from "electron";
import { authenticate } from "core/auth/yggdrasil";
import { genUUID } from "core/auth";

export type MinecraftAuthMode = "mojang" | "microsoft" | "authlib" | "offline";

export interface MinecraftAccount extends WithUnderline {
  email: string;
  name: string;
  uuid: string;
  token: string;
  authserver?: string;
  refreshToken?: string;
  mode: MinecraftAuthMode;
}

export interface CreateAccountImplResult {
  success: boolean;
  message?: "msAccNoMinecraft" | string;
}

function appendAccount(account: MinecraftAccount) {
  setConfig((cfg) => cfg.accounts.push(account));
  commonLogger.info(`Created new ${account.mode} account`);
}

export async function createAccount(
  mode: string,
  username: string,
  password: string,
  authserver: string,
  replace?: MinecraftAccount
): Promise<CreateAccountImplResult> {
  const unsuccessfulResult: CreateAccountImplResult = { success: false };
  const successfulResult: CreateAccountImplResult = { success: true };
  if (mode === "microsoft") {
    // Microsoft OAuth Flow
    let authCode = "";

    const unsuccessfulWith = (reason: string) => {
      rendererLogger.error(reason);
      return {
        success: false,
        message: reason,
      };
    };

    const result = await ipcRenderer.invoke("ms-auth");
    const split = result.split("&");
    for (const i of split) {
      const j = i.split("=");
      if (j[0] === "code") {
        authCode = j[1];
      }
    }
    if (authCode === "") {
      // unusable auth code
      return unsuccessfulWith(
        "Unable to get auth code at microsoft authenticating"
      );
    }

    // Authorization Code -> Authorization Token
    const authTokenResult = await authCode2AuthToken(authCode);
    const authToken = authTokenResult.access_token;
    const refreshToken = authTokenResult.refresh_token;
    if (authTokenResult.error || !authToken) {
      // unable to get auth token
      return unsuccessfulWith(
        "Unable to get auth token at microsoft authenticating"
      );
    }

    const minecraftTokenResult = await authToken2MinecraftTokenDirectly(
      authToken
    );
    const minecraftToken = minecraftTokenResult.token;
    if (minecraftTokenResult.errorMessage || !minecraftToken) {
      return unsuccessfulWith("Unable to get Minecraft token");
    }

    // Check Minecraft Ownership
    const ownership = await checkMinecraftOwnership(minecraftToken);
    const len = ownership.items?.length;
    if (len && len > 0) {
      // Get minecraft profile
      const prof = await getMicrosoftMinecraftProfile(minecraftToken);
      const uuid = prof.id;
      const name = prof.name;
      if (prof.error || !uuid || !name) {
        throw new Error("Unable to get Minecraft profile");
      } else {
        const accountProperties: MinecraftAccount = {
          email: username,
          name,
          uuid,
          token: minecraftToken,
          refreshToken,
          mode: "microsoft",
        };
        if (replace) {
          setConfig((cfg) =>
            cfg.accounts.forEach((value) => {
              if (value === replace) {
                Object.assign(value, accountProperties);
              }
            })
          );
          commonLogger.info(`Updated account access token`);
        } else {
          appendAccount(accountProperties);
        }
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
    const uuid = genUUID();
    appendAccount({
      email: "",
      name: username,
      uuid,
      token: uuid,
      mode: "offline",
    });
    return successfulResult;
  }
}

export function removeAccount(account: MinecraftAccount): void {
  setConfig((cfg) => _.remove(cfg.accounts, account));
  commonLogger.info(`Removed account`);
}

export function updateAccountToken(
  account: MinecraftAccount,
  newToken: string,
  refreshToken?: string // microsoft account only
): void {
  setConfig((cfg) =>
    cfg.accounts.forEach((value) => {
      if (value === account) {
        value.token = newToken;
        if (refreshToken) {
          value.refreshToken = refreshToken;
        }
      }
    })
  );
  commonLogger.info(`Updated account access token`);
}
