import { DefaultCb, form, StringMap } from "common/utils";
import crypto from "crypto";

// official authentication server url
export const MOJANG_AUTHSERVER_URL = "https://authserver.mojang.com";

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

function simpleProcessor(
  resolve: (value: WithErr | PromiseLike<WithErr>) => void
): DefaultCb<string, [number, string]> {
  return (err, data) => {
    if (err || !data) {
      resolve({ err: true });
    } else {
      resolve(JSON.parse(data[1]));
    }
  };
}

export function authenticate(
  username: string,
  password: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<AuthenticateResult> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      url + "/authenticate",
      (err, data) => {
        if (err || !data) {
          resolve({ err: true, token: "", uuid: "", name: "" });
        } else {
          const [_, body] = data;
          const param = JSON.parse(body);
          const prof = param["selectedProfile"];
          resolve({
            err: false,
            token: param["accessToken"],
            uuid: prof["id"],
            name: prof["name"],
          });
        }
      },
      json({
        agent: {
          name: "Minecraft",
          version: 1,
        },
        username: username,
        password: password,
      })
    )
  );
}

export function refresh(
  token: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<RefreshResult> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      url + "/refresh",
      (err, data) => {
        if (err || !data) {
          resolve({ err: true, token: "" });
        } else {
          const [status, body] = data;
          const err = status >= 200 && status < 300;
          resolve({
            err,
            token: status ? JSON.parse(body)["accessToken"] : "",
          });
        }
      },
      json({ accessToken: token })
    )
  );
}

export function validate(
  token: string,
  url: string = MOJANG_AUTHSERVER_URL
): Promise<boolean> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      url + "/validate",
      (err, data) => {
        if (err || !data) {
          resolve(false);
        } else {
          const [status] = data;
          resolve(status >= 200 && status < 300);
        }
      },
      json({ accessToken: token })
    )
  );
}

// the meta part of a minecraft jwt
// {"alg": "NONE", "type": "JWT"}
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
  const data = `${JWT_META_BASE64}.${Buffer.from(
    JSON.stringify(payload)
  ).toString("base64")}`;
  return `${data}.${crypto.createHash("sha256").update(data).digest("hex")}`;
}

// === MICROSOFT AUTHENTICATION PART === //
export interface XBLTokenResult extends WithErr {
  IssueInstance?: string;
  NotAfter?: string;
  Token?: string;
  DisplayClaims?: {
    xui: {
      uhs: string;
    }[];
  };
}

export interface XSTSTokenResult extends WithErr {
  IssueInstance?: string;
  NotAfter?: string;
  Token?: string;
  DisplayClaims?: {
    xui: {
      uhs: string;
    }[];
  };
}

export interface MicrosoftMinecraftTokenResult extends WithErr {
  username?: string; // some uuid but not the uuid of account
  roles?: [];
  access_token?: string; // Minecraft access token (JWT)
  token_type?: string;
  expires_in?: number;
}

export interface MinecraftOwnershipResult extends WithErr {
  items?: {
    name: string;
    signature: string;
  }[];
  signature?: string;
  keyId?: string;
}

export interface MicrosoftMinecraftProfileResult extends WithErr {
  id?: string; // really uuid of account
  name?: string; // username of account
  skins?: [];
  capes?: [];
}

export function authCode2AuthToken(code: string): Promise<StringMap> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      "https://login.live.com/oauth20_token.srf",
      (err, data) => {
        if (err || !data) {
          resolve({ err: "err" });
        } else {
          resolve(JSON.parse(data[1]));
        }
      },
      form({
        client_id: "00000000402b5328",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "https://login.live.com/oauth20_desktop.srf",
        scope: "service::user.auth.xboxlive.com::MBI_SSL",
      }),
      undefined,
      true
    )
  );
}

export function authToken2XBLToken(token: string): Promise<XBLTokenResult> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      "https://user.auth.xboxlive.com/user/authenticate",
      simpleProcessor(resolve),
      json({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: token,
        },
        RelyingParty: "https://auth.xboxlive.com",
        TokenType: "JWT",
      })
    )
  );
}

export function XBLToken2XSTSToken(token: string): Promise<XSTSTokenResult> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      "https://xsts.auth.xboxlive.com/xsts/authorize",
      simpleProcessor(resolve),
      json({
        Properties: {
          SandboxId: "RETAIL",
          UserTokens: [token],
        },
        RelyingParty: "rp://api.minecraftservices.com/",
        TokenType: "JWT",
      })
    )
  );
}

export function XSTSToken2MinecraftToken(
  token: string,
  uhs: string
): Promise<MicrosoftMinecraftTokenResult> {
  return new Promise((resolve) =>
    window.native.request(
      "post",
      "https://api.minecraftservices.com/authentication/login_with_xbox",
      simpleProcessor(resolve),
      json({
        identityToken: `XBL3.0 x=${uhs};${token}`,
      })
    )
  );
}

export function checkMinecraftOwnership(
  token: string
): Promise<MinecraftOwnershipResult> {
  return new Promise((resolve) =>
    window.native.request(
      "get",
      "https://api.minecraftservices.com/entitlements/mcstore",
      simpleProcessor(resolve),
      undefined,
      `Bearer ${token}`
    )
  );
}

export function getMicrosoftMinecraftProfile(
  token: string
): Promise<MicrosoftMinecraftProfileResult> {
  return new Promise((resolve) =>
    window.native.request(
      "get",
      "https://api.minecraftservices.com/minecraft/profile",
      simpleProcessor(resolve),
      undefined,
      `Bearer ${token}`
    )
  );
}
