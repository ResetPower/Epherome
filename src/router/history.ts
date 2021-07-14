import { unwrapFunction } from "../tools";
import { DefaultFunction, StringMap } from "../tools/types";

export interface Location {
  pathname: string;
  params: StringMap;
}

export class EphHistory {
  location: Location = { pathname: "/", params: {} };
  paths = ["/"];
  animationTimeout: number;
  constructor(timeout = 120) {
    this.animationTimeout = timeout;
  }
  // listeners
  private histListener = unwrapFunction();
  private animeListener = unwrapFunction();
  pathname(): string {
    return this.location.pathname;
  }
  listen(listener: DefaultFunction): void {
    this.histListener = listener;
  }
  listenAnime(listener: DefaultFunction): void {
    this.animeListener = listener;
  }
  // actions
  private act = (block: DefaultFunction): void => {
    this.animeListener();
    setTimeout(() => {
      block();
      this.histListener();
    }, this.animationTimeout);
  };
  push = (pathname: string, params: StringMap = {}): void =>
    this.act(() => {
      this.paths.push(this.pathname());
      this.location = { pathname, params };
    });
  replace = (pathname: string, params: StringMap = {}): void =>
    this.act(() => (this.location = { pathname, params }));
  goBack = (): void => this.act(() => (this.location.pathname = this.paths.pop() ?? "/"));
}
