import { Hitokoto } from "common/struct/hitokoto";
import { JavaWithoutNanoid } from "common/struct/java";
import { NewItem } from "common/struct/news";
import { DefaultCb } from "common/utils";

export interface Native {
  hello(): string;
  findJavas(): string[] | never;
  findJavaExecutable(pathname: string): string | never;
  checkJava(pathname: string): JavaWithoutNanoid | never;
  extractZip(file: string, target: string): void | never;
  fetchHitokoto(cb: DefaultCb<string, Hitokoto>): undefined;
  fetchNews(cb: DefaultCb<string, NewItem[]>): undefined;
}

declare global {
  export interface Window {
    native: Native;
  }
}
