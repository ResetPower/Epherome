import { WithErr } from ".";
import got from "got";
import { json } from "common/utils";

interface AuthenticateResult extends WithErr {
  token: string;
  uuid: string;
  name: string;
}

interface RefreshResult extends WithErr {
  token: string;
}

export async function authenticate(
  username: string,
  password: string,
  url: string
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
  url: string
): Promise<RefreshResult> {
  try {
    const response = await got(url + "/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: { accessToken: token },
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

export async function validate(token: string, url: string): Promise<boolean> {
  try {
    await got(url + "/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: { accessToken: token },
    });
    return true;
  } catch (e) {
    return false;
  }
}
