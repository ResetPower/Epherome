import { JavaWithoutNanoid } from "./common/struct/java";
import { NewItem } from "./common/struct/news";

declare global {
  interface Window {
    native: {
      // to see if Rust addon works well
      hello(): string;
      fetchNews(): Promise<NewItem[]> | never;
      findJavas(): string[] | never;
      // find java executable file path from user input
      findJavaExecutable(pathname: string): string | never;
      // check availability and get information of a java executable file
      checkJava(pathname: string): JavaWithoutNanoid | never;
      extractZip(file: string, target: string): Promise<boolean> | never;
      compressZip(folder: string, target: string): Promise<boolean> | never;
    };
  }
}
