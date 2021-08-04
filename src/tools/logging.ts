import { Configuration } from "log4js";

export default function log4jsConfiguration(
  logFilename: string
): Configuration {
  return {
    appenders: {
      console: { type: "stdout" },
      file: {
        type: "fileSync",
        filename: logFilename,
      },
    },
    categories: {
      default: { appenders: ["console", "file"], level: "info" },
    },
  };
}
