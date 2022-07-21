import { commonLogger } from "common/loggers";
import { WithUnderline, _ } from "common/utils/arrays";
import { setConfig } from "./config";

export interface MinecraftServer extends WithUnderline {
  edition: "java" | "bedrock";
  name: string;
  ip: string;
  port?: string; // Bedrock Edition Only
}

export function createServer(server: MinecraftServer): boolean {
  if (server.name === "" || server.ip === "") return false;
  setConfig((cfg) => cfg.servers.push(server));
  commonLogger.info(`Created server named '${server.name}'`);
  return true;
}

export function removeServer(server: MinecraftServer): void {
  setConfig((cfg) => _.remove(cfg.servers, server));
  commonLogger.info(`Removed server`);
}
