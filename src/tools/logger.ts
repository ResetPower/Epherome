export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogMessage = string | string[];

function appendZero(src: number): string {
  if (0 <= src && src < 10) {
    return `0${src}`;
  }
  return src.toString();
}

export const ephLoggerMessages: string[] = [];

export class Logger {
  scope: string;
  constructor(scope: string) {
    this.scope = scope;
  }
  private outputText = (chunk: string): void => {
    process.stdout.write(`${chunk}\n`);
    ephLoggerMessages.push(chunk);
  };
  private makeTime = (): string => {
    const date = new Date();
    return `${appendZero(date.getHours())}:${appendZero(
      date.getMinutes()
    )}:${appendZero(date.getSeconds())}`;
  };
  log = (level: LogLevel, msg: LogMessage): void => {
    const time = this.makeTime();
    if (typeof msg === "string") {
      this.outputText(`[${time}] [${this.scope}/${level}] ${msg}`);
    } else if (typeof msg === "object") {
      for (const i of msg) {
        this.outputText(`[${time}] [${this.scope}/${level}] ${i}`);
      }
    }
  };
  debug = (msg: LogMessage): void => this.log("DEBUG", msg);
  info = (msg: LogMessage): void => this.log("INFO", msg);
  warn = (msg: LogMessage): void => this.log("WARN", msg);
  error = (msg: LogMessage): void => this.log("ERROR", msg);
}
