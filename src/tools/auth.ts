// official authentication server url
import { ephFetch } from "./http";
import { StringMap } from "./i18n";
import { obj2form } from "./objects";

export const MOJANG_AUTHSERVER_URL = "https://authserver.mojang.com";

interface AuthenticateResult {
  err: boolean;
  token: string;
  uuid: string;
  name: string;
}

interface RefreshResult {
  err: boolean;
  token: string;
}

// http status code 2xx means successful
export function isSuccess(code: number): boolean {
  return code >= 200 && code < 300;
}

export async function authenticate(
  username: string,
  password: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<AuthenticateResult> {
  const response = await ephFetch(url + "/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent: {
        name: "Minecraft",
        version: 1,
      },
      username: username,
      password: password,
    }),
  });
  if (isSuccess(response.status)) {
    const param = JSON.parse(response.text);
    const prof = param["selectedProfile"];
    return {
      err: false,
      token: param["accessToken"],
      uuid: prof["id"],
      name: prof["name"],
    };
  } else {
    return { err: true, token: "", uuid: "", name: "" };
  }
}

export async function refresh(
  token: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<RefreshResult> {
  const response = await ephFetch(url + "/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken: token }),
  });
  if (isSuccess(response.status)) {
    return {
      err: false,
      token: JSON.parse(response.text)["accessToken"],
    };
  } else {
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
  const response = await ephFetch(url + "/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken: token }),
  });
  return isSuccess(response.status);
}

// the meta part of a minecraft jwt
const JWT_META_BASE64 = "eyJhbGciOiAiTk9ORSIsICJ0eXBlIjogIkpXVCJ9";

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

// generate fake access token for offline account
export function genOfflineToken(name: string): string {
  const payload = {
    name: encodeURIComponent(name),
  };
  return `${JWT_META_BASE64}.${btoa(JSON.stringify(payload))}.${Math.random()}`;
}

// === MICROSOFT AUTHENTICATION PART === //
export interface XBLTokenResult {
  err?: boolean;
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
  err?: boolean;
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
  err?: boolean;
  username?: string; // some uuid but not the uuid of account
  roles?: [];
  access_token?: string; // Minecraft access token (JWT)
  token_type?: string;
  expires_in?: number;
}

export interface MinecraftOwnershipResult {
  err?: boolean;
  items?: {
    name: string;
    signature: string;
  }[];
  signature?: string;
  keyId?: string;
}

export interface MicrosoftMinecraftProfileResult {
  err?: boolean;
  id?: string; // really uuid of account
  name?: string; // username of account
  skins?: [];
  capes?: [];
}

export async function authCode2AuthToken(code: string): Promise<StringMap> {
  const result = await ephFetch("https://login.live.com/oauth20_token.srf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: obj2form({
      client_id: "00000000402b5328",
      code: code,
      grant_type: "authorization_code",
      redirect_uri: "https://login.live.com/oauth20_desktop.srf",
      scope: "service::user.auth.xboxlive.com::MBI_SSL",
    }),
  });
  if (result.err || !isSuccess(result.status)) {
    // unable to get auth token
    return { err: "err" };
  } else {
    return JSON.parse(result.text);
  }
}

export async function authToken2XBLToken(token: string): Promise<XBLTokenResult> {
  const result = await ephFetch("https://user.auth.xboxlive.com/user/authenticate", {
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
  });
  if (result.err || !isSuccess(result.status)) {
    // unable to get xbl token
    return { err: true };
  } else {
    return JSON.parse(result.text);
  }
}

export async function XBLToken2XSTSToken(token: string): Promise<XSTSTokenResult> {
  const result = await ephFetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
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
  if (result.err || !isSuccess(result.status)) {
    // unable to get xsts token
    return { err: true };
  } else {
    return JSON.parse(result.text);
  }
}

export async function XSTSToken2MinecraftToken(
  token: string,
  uhs: string
): Promise<MicrosoftMinecraftTokenResult> {
  const result = await ephFetch(
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
  if (result.err || !isSuccess(result.status)) {
    return { err: true };
  } else {
    return JSON.parse(result.text);
  }
}

export async function checkMinecraftOwnership(token: string): Promise<MinecraftOwnershipResult> {
  const result = await ephFetch("https://api.minecraftservices.com/entitlements/mcstore", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (result.err || !isSuccess(result.status)) {
    return { err: true };
  } else {
    return JSON.parse(result.text);
  }
}

export async function getMicrosoftMinecraftProfile(
  token: string
): Promise<MicrosoftMinecraftProfileResult> {
  const result = await ephFetch("https://api.minecraftservices.com/minecraft/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application.json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (result.err || !isSuccess(result.status)) {
    return { err: true };
  } else {
    return JSON.parse(result.text);
  }
}
