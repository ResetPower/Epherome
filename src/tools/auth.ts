// official authentication server url
import { ephFetch } from "./http";

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
