import { JavaWithoutNanoid } from "./common/struct/java";
import { NewItem } from "./common/struct/news";
import { DefaultCb } from "./common/utils";

declare global {
  interface Window {
    native: {
      // to see if Rust addon works well
      hello(): string;
      fetchNews(cb: DefaultCb<string, NewItem[]>): void | never;
      findJavas(): string[] | never;
      // find java executable file path from user input
      findJavaExecutable(pathname: string): string | never;
      // check availability and get information of a java executable file
      checkJava(pathname: string): JavaWithoutNanoid | never;
      extractZip(file: string, target: string): void | never;
    };
  }
}
