import { invoke } from "@tauri-apps/api";
import { once } from "@tauri-apps/api/event";
import { Body, fetch } from "@tauri-apps/api/http";
import { cfg } from "../../stores/config";

export interface MinecraftOwnershipResult {
  error?: unknown;
  items?: {
    name: string;
    signature: string;
  }[];
  signature?: string;
  keyId?: string;
}

export type MicrosoftMinecraftProfileResult =
  | { error: string }
  | {
      id: string; // uuid
      name: string; // mc user name
      skins: {
        id: string;
        state: string;
        url: string;
        variant: string;
        alias: string;
      }[];
      capes: [];
    };

// minecraft (microsoft) authentication client id
const MICROSOFT_CLIENT_ID = "00000000402b5328";

// Auth Code -> Auth Token
async function getAuthToken(authCode: string): Promise<string> {
  const result = await fetch("https://login.live.com/oauth20_token.srf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: Body.form({
      client_id: MICROSOFT_CLIENT_ID,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: "https://login.live.com/oauth20_desktop.srf",
      scope: "service::user.auth.xboxlive.com::MBI_SSL",
    }),
  });
  const data = result.data as { access_token?: string };
  if (data.access_token) {
    return data.access_token;
  } else throw new Error("Failed to get auth token.");
}

// Auth Token -> [Xbl Token, User Hash]
async function getXblToken(authToken: string): Promise<[string, string]> {
  const result = await fetch(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: Body.json({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: authToken,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
    }
  );
  const data = result.data as {
    Token?: string;
    DisplayClaims?: {
      xui: [{ uhs: string }];
    };
  };
  const [xblToken, userHash] = [data.Token, data.DisplayClaims?.xui[0].uhs];
  if (xblToken && userHash) {
    return [xblToken, userHash];
  } else throw new Error("Failed to get XBL token.");
}

async function getXstsToken(xblToken: string): Promise<string> {
  const result = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: Body.json({
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [xblToken],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    }),
  });
  const data = result.data as { Token?: string };
  if (data.Token) {
    return data.Token;
  } else throw new Error("Failed to get XSTS token.");
}

async function getMinecraftToken(
  xstsToken: string,
  userHash: string
): Promise<string> {
  const result = await fetch(
    "https://api.minecraftservices.com/authentication/login_with_xbox",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: Body.json({
        identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
      }),
    }
  );
  const data = result.data as { access_token?: string };
  if (data.access_token) {
    return data.access_token;
  } else throw new Error("Failed to get Minecraft token.");
}

async function checkMinecraftOwnership(
  token: string
): Promise<MinecraftOwnershipResult> {
  const result = await fetch(
    "https://api.minecraftservices.com/entitlements/mcstore",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = result.data as MinecraftOwnershipResult;
  return data;
}

async function getMicrosoftMinecraftProfile(
  token: string
): Promise<MicrosoftMinecraftProfileResult> {
  const result = await fetch(
    "https://api.minecraftservices.com/minecraft/profile",
    {
      method: "GET",
      headers: {
        "Content-Type": "application.json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = result.data as MicrosoftMinecraftProfileResult;
  if ("error" in data) {
    throw new Error(data.error);
  } else return data;
}

export function validateMicrosoft(token: string): boolean {
  try {
    const payload = atob(token.split(".")[1]);
    const params = JSON.parse(payload);
    return Math.floor(Date.now() / 1000) < params.exp;
  } catch {
    return false;
  }
}

export async function createMicrosoftAccount(): Promise<boolean> {
  await invoke("get_microsoft_auth_code");
  const authCode = await new Promise<string>((resolve, reject) => {
    once("auth-code", (event) => {
      const params = new URLSearchParams(event.payload as string);
      const code = params.get("code");
      if (code) resolve(code);
      else reject("Auth code does not exist on the search params.");
    }).catch(reject);
  });
  console.log(authCode);
  const authToken = await getAuthToken(authCode);
  const [xblToken, userHash] = await getXblToken(authToken);
  const xstsToken = await getXstsToken(xblToken);
  const minecraftToken = await getMinecraftToken(xstsToken, userHash);

  const ownership = await checkMinecraftOwnership(minecraftToken);
  if (ownership.items?.length) {
    const profile = await getMicrosoftMinecraftProfile(minecraftToken);
    if (!("error" in profile)) {
      cfg.accounts.add(
        {
          uuid: profile.id,
          name: profile.name,
          type: "microsoft",
          token: minecraftToken,
          time: Date.now(),
        },
        true
      );
      return true;
    }
  }
  return false;
}
