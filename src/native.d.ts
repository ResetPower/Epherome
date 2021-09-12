import { JavaWithoutNanoid } from "common/struct/java";

export interface Native {
  hello(): string;
  findJavas(): ?string[];
  checkJava(pathname: string): ?JavaWithoutNanoid;
}

declare global {
  export interface Window {
    native: Native;
  }
}
