import { JavaWithoutNanoid } from "common/struct/java";

export interface Native {
  hello(): string;
  findJavas(): string[] | never;
  findJavaExecutable(pathname: string): string | never;
  checkJava(pathname: string): JavaWithoutNanoid | never;
  extractZip(file: string, target: string): void | never;
}

declare global {
  export interface Window {
    native: Native;
  }
}
