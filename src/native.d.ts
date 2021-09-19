import { JavaWithoutNanoid } from "common/struct/java";

export interface Native {
  hello(): string;
  findJavas(): string[] | undefined;
  checkJava(pathname: string): JavaWithoutNanoid | undefined;
}

declare global {
  export interface Window {
    native: Native;
  }
}
