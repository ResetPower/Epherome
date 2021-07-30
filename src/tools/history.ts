import { unwrapFunction } from ".";
import { DefaultFn, StringMap } from "./types";

export interface Location {
  pathname: string;
  params: StringMap;
}

// these functions will be used in JSX so they're all arrow functions
export class EphHistory {
  location: Location = { pathname: "", params: {} };
  paths: string[] = [];
  animationTimeout: number;
  constructor(timeout = 120) {
    this.animationTimeout = timeout;
  }
  // listeners
  private histListener = unwrapFunction();
  private animeListener = unwrapFunction();
  listen(listener: DefaultFn): void {
    this.histListener = listener;
  }
  listenAnime(listener: DefaultFn): void {
    this.animeListener = listener;
  }
  // action wrapper
  private act = (block: DefaultFn): void => {
    this.animeListener();
    setTimeout(() => {
      block();
      this.histListener();
    }, this.animationTimeout);
  };
  push = (pathname: string, params: StringMap = {}): void =>
    this.act(() => {
      this.paths.push(this.location.pathname);
      this.location = { pathname, params };
    });
  replace = (pathname: string, params: StringMap = {}): void =>
    this.act(() => (this.location = { pathname, params }));
  goBack = (): void =>
    this.act(() => (this.location.pathname = this.paths.pop() ?? ""));
  dispatch = (): void => this.histListener();
}
