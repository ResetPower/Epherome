import { Body, fetch } from "@tauri-apps/api/http";
import { YggdrasilAuthenticateResult, YggdrasilRefreshResult } from "./struct";
import { cfg } from "../../stores/config";
import { MinecraftAccount } from "../../stores/struct";

const clientToken = "epherome";

export class YggdrasilAuthenticator {
  server: string;
  constructor(server: string) {
    this.server = server;
  }
  private async authenticate(username: string, password: string) {
    return (
      await fetch(`${this.server}/authserver/authenticate`, {
        method: "POST",
        body: Body.json({
          username,
          password,
          clientToken,
          agent: {
            name: "Minecraft",
            version: 1,
          },
        }),
      })
    ).data as YggdrasilAuthenticateResult;
  }
  async refresh(accessToken: string): Promise<string> {
    const result = await fetch(`${this.server}/authserver/refresh`, {
      method: "POST",
      body: Body.json({ accessToken, clientToken }),
    });
    return (result.data as YggdrasilRefreshResult).accessToken;
  }
  async validate(accessToken: string): Promise<boolean> {
    const result = await fetch(`${this.server}/authserver/validate`, {
      method: "POST",
      body: Body.json({ accessToken, clientToken }),
    });
    return result.ok;
  }
  async createAccount(username: string, password: string) {
    const result = await this.authenticate(username, password);
    cfg.accounts.add(
      {
        type: "authlib",
        name: result.selectedProfile.name,
        uuid: result.selectedProfile.id,
        authserver: this.server,
        token: result.accessToken,
        time: Date.now(),
      },
      true
    );
  }
  update(account: MinecraftAccount, newToken: string) {
    account.token = newToken;
    cfg.saveAsync();
  }
}

export async function prefetch(authserver: string): Promise<string> {
  const resp = await fetch(authserver, { method: "GET" });
  return btoa(JSON.stringify(resp.data));
}
