import { rendererLogger } from "common/loggers";
import { MinecraftAccount, updateAccountToken } from "common/struct/accounts";
import { form, StringMap } from "common/utils";
import got from "got";

// yggdrasil authentication server url
export const MOJANG_AUTHSERVER_URL = "https://authserver.mojang.com";

// minecraft (microsoft) authentication client id
export const MICROSOFT_CLIENT_ID = "00000000402b5328";

interface WithErr {
  err?: boolean;
}

interface AuthenticateResult extends WithErr {
  token: string;
  uuid: string;
  name: string;
}

interface RefreshResult extends WithErr {
  token: string;
}

function json(object: { [key: string]: unknown }): string {
  return JSON.stringify(object);
}

export async function authenticate(
  username: string,
  password: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<AuthenticateResult> {
  try {
    const resp = await got(`${url}/authenticate`, {
      body: json({
        agent: {
          name: "Minecraft",
          version: 1,
        },
        username: username,
        password: password,
      }),
    });
    const param = JSON.parse(resp.body);
    const prof = param["selectedProfile"];
    return {
      err: false,
      token: param["accessToken"],
      uuid: prof["id"],
      name: prof["name"],
    };
  } catch {
    return { err: true, token: "", uuid: "", name: "" };
  }
}

export async function refresh(
  token: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<RefreshResult> {
  try {
    const response = await got(url + "/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token }),
    });
    return {
      err: false,
      token: JSON.parse(response.body)["accessToken"],
    };
  } catch (e) {
    return {
      err: true,
      token: "",
    };
  }
}

export async function validate(
  token: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<boolean> {
  try {
    await got(url + "/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

// generate fake uuid for offline account
export function genUUID(): string {
  let result = "";
  for (let j = 0; j < 32; j++) {
    const i = Math.floor(Math.random() * 16)
      .toString(16)
      .toLowerCase();
    result = result + i;
  }
  return result;
}

// === MICROSOFT AUTHENTICATION PART === //
export interface XBLTokenResult {
  error?: unknown;
  IssueInstance?: string;
  NotAfter?: string;
  Token?: string;
  DisplayClaims?: {
    xui: {
      uhs: string;
    }[];
  };
}

export interface XSTSTokenResult {
  error?: unknown;
  IssueInstance?: string;
  NotAfter?: string;
  Token?: string;
  DisplayClaims?: {
    xui: {
      uhs: string;
    }[];
  };
}

export interface MicrosoftMinecraftTokenResult {
  error?: unknown;
  username?: string; // some uuid but not the uuid of account
  roles?: [];
  access_token?: string; // Minecraft access token (JWT)
  token_type?: string;
  expires_in?: number;
}

export interface MinecraftOwnershipResult {
  error?: unknown;
  items?: {
    name: string;
    signature: string;
  }[];
  signature?: string;
  keyId?: string;
}

export interface MicrosoftMinecraftProfileResult {
  error?: unknown;
  id?: string; // really uuid of account
  name?: string; // username of account
  skins?: [];
  capes?: [];
}

export async function authCode2AuthToken(code: string): Promise<StringMap> {
  try {
    const result = await got("https://login.live.com/oauth20_token.srf", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form({
        client_id: MICROSOFT_CLIENT_ID,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "https://login.live.com/oauth20_desktop.srf",
        scope: "service::user.auth.xboxlive.com::MBI_SSL",
      }),
    });
    return JSON.parse(result.body);
  } catch (e) {
    // unable to get auth token
    return { err: "err" };
  }
}

async function authToken2XBLToken(token: string): Promise<XBLTokenResult> {
  try {
    const result = await got(
      "https://user.auth.xboxlive.com/user/authenticate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Properties: {
            AuthMethod: "RPS",
            SiteName: "user.auth.xboxlive.com",
            RpsTicket: token,
          },
          RelyingParty: "http://auth.xboxlive.com",
          TokenType: "JWT",
        }),
      }
    );
    return JSON.parse(result.body);
  } catch (error) {
    // unable to get xbl token
    return { error };
  }
}

async function XBLToken2XSTSToken(token: string): Promise<XSTSTokenResult> {
  try {
    const result = await got("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Properties: {
          SandboxId: "RETAIL",
          UserTokens: [token],
        },
        RelyingParty: "rp://api.minecraftservices.com/",
        TokenType: "JWT",
      }),
    });
    return JSON.parse(result.body);
  } catch (error) {
    // unable to get xsts token
    return { error };
  }
}

async function XSTSToken2MinecraftToken(
  token: string,
  uhs: string
): Promise<MicrosoftMinecraftTokenResult> {
  try {
    const result = await got(
      "https://api.minecraftservices.com/authentication/login_with_xbox",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identityToken: `XBL3.0 x=${uhs};${token}`,
        }),
      }
    );
    return JSON.parse(result.body);
  } catch (error) {
    return { error };
  }
}

export async function checkMinecraftOwnership(
  token: string
): Promise<MinecraftOwnershipResult> {
  try {
    const result = await got(
      "https://api.minecraftservices.com/entitlements/mcstore",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return JSON.parse(result.body);
  } catch (error) {
    return { error };
  }
}

export async function getMicrosoftMinecraftProfile(
  token: string
): Promise<MicrosoftMinecraftProfileResult> {
  try {
    const result = await got(
      "https://api.minecraftservices.com/minecraft/profile",
      {
        method: "GET",
        headers: {
          "Content-Type": "application.json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return JSON.parse(result.body);
  } catch (error) {
    return { error };
  }
}

export function validateMicrosoft(token: string): boolean {
  const payload = Buffer.from(token.split(".")[1], "base64").toString();
  const params = JSON.parse(payload);
  return Math.floor(Date.now() / 1000) < params.exp;
}

export async function refreshMicrosoft(
  account: MinecraftAccount
): Promise<boolean> {
  try {
    if (!account.refreshToken || account.mode !== "microsoft") {
      throw new Error("The account is not satisfied with this action");
    }
    const result = await got("https://login.live.com/oauth20_token.srf", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form({
        client_id: MICROSOFT_CLIENT_ID,
        refresh_token: account.refreshToken,
        grant_type: "refresh_token",
        redirect_uri: "https://login.live.com/oauth20_desktop.srf",
      }),
    });
    const params = JSON.parse(result.body);
    const mcTokenResult = await authToken2MinecraftTokenDirectly(
      params["access_token"]
    );
    const mcToken = mcTokenResult.token;
    if (mcTokenResult.errorMessage || !mcToken) {
      return false;
    }
    updateAccountToken(account, mcToken, params["refresh_token"]);
    return true;
  } catch {
    return false;
  }
}

export interface DirectlyToMinecraftTokenResult {
  token?: string;
  errorMessage?: string;
}

export async function authToken2MinecraftTokenDirectly(
  authToken: string
): Promise<DirectlyToMinecraftTokenResult> {
  const unsuccessfulWith = (msg: string) => {
    rendererLogger.warn(msg);
    return {
      errorMessage: msg,
    };
  };
  // Authorization Token -> XBL Token
  const XBLTokenResult = await authToken2XBLToken(authToken);
  const XBLToken = XBLTokenResult.Token;
  if (XBLTokenResult.error || !XBLToken) {
    // unable to get xbl token
    return unsuccessfulWith(
      "Unable to get XBL token at microsoft authenticating"
    );
  }

  // XBL Token -> XSTS Token
  const XSTSTokenResult = await XBLToken2XSTSToken(XBLToken);
  const XSTSToken = XSTSTokenResult.Token;
  const XSTSTokenUhs = XSTSTokenResult.DisplayClaims?.xui[0].uhs;
  if (XSTSTokenResult.error || !XSTSToken || !XSTSTokenUhs) {
    // unable to get xsts token
    return unsuccessfulWith(
      "Unable to XSTS auth token at microsoft authenticating"
    );
  }

  // XSTS Token -> Minecraft Token
  const minecraftTokenResult = await XSTSToken2MinecraftToken(
    XSTSToken,
    XSTSTokenUhs
  );
  const minecraftToken = minecraftTokenResult.access_token;
  if (minecraftTokenResult.error || !minecraftToken) {
    // unable to get minecraft token
    return unsuccessfulWith("Unable to get Minecraft token");
  }

  return { token: minecraftToken };
}
