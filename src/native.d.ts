import { JavaWithoutNanoid } from "common/struct/java";
import { NewItem } from "common/struct/news";
import { DefaultCb, Nullable, StringMap } from "common/utils";
import { ParallelDownloadItem } from "common/utils/files";

export interface Native {
  hello(): string;
  findJavas(): string[] | never;
  findJavaExecutable(pathname: string): string | never;
  checkJava(pathname: string): JavaWithoutNanoid | never;
  extractZip(file: string, target: string): void | never;
  fetchNews(cb: DefaultCb<string, NewItem[]>): undefined;
  request(
    method: "get" | "post",
    url: string,
    cb: DefaultCb<string, [number, string]>,
    payload?: string,
    authorization?: string,
    contentTypeForm?: boolean
  ): undefined;
  downloadFile(
    url: string,
    target: string,
    cb: (err: Nullable<string>) => void,
    id: number,
    showProgress: boolean,
    recursive?: boolean
  ): undefined;
  parallelDownload(
    items: ParallelDownloadItem[],
    concurrency: number,
    id: number
  ): undefined;
  task: {
    cancel(id: number): void | never;
  };
}

export interface Exchange {
  send(tunnel: string, arg: string): void;
  listen(tunnel: string, cb: (arg: string) => void): void;
}

declare global {
  interface Window {
    native: Native;
    exchange: Exchange;
  }
}
