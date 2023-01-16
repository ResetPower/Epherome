import { EphExtension } from "./../common/extension";
import {
  notificationStore,
  NotificationType,
} from "./../common/stores/notification";
import fs from "fs";

interface Command {
  invoke: string;
  action: string;
  arg?: {
    message?: string;
    type?: string;
  };
}

function interpretCommand(command: Command, ext: EphExtension) {
  if (
    command.invoke === "NotificationManager" &&
    command.action === "put" &&
    command.arg
  ) {
    notificationStore.push({
      message: command.arg.message ?? String(),
      type: command.arg.type as NotificationType,
      source: ext.manifest.name,
    });
  }
}

export function interpret(filepath: string, ext: EphExtension) {
  const code = fs.readFileSync(filepath).toString();
  const parsed = JSON.parse(code);
  if (Array.isArray(parsed)) {
    parsed.forEach((n) => interpretCommand(n, ext));
  } else {
    interpretCommand(parsed, ext);
  }
}
