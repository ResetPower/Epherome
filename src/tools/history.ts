import { broadcast } from "../renderer/session";
import { StringMap } from "./i18n";

export class EphHistory {
  loc = { pathname: "/", params: {} };
  paths = ["/"];
  // animation lasts 120 ms
  animationTimeout = 120;
  // broadcast title update message
  private invokeListeners = (): void => broadcast("hist", this.loc.pathname);
  // broadcast animation start message
  private invokeAnimationListeners = (): void => broadcast("anm");
  pathname = (): string => {
    return this.loc.pathname;
  };
  act = (block: () => void): void => {
    this.invokeAnimationListeners();
    setTimeout(() => {
      block();
      this.invokeListeners();
    }, this.animationTimeout);
  };
  push = (pathname: string, params: StringMap = {}): void =>
    this.act(() => {
      this.paths.push(this.pathname());
      this.loc.pathname = pathname;
      this.loc.params = params;
    });
  replace = (pathname: string, params: StringMap = {}): void =>
    this.act(() => {
      this.loc.pathname = pathname;
      this.loc.params = params;
    });
  goBack = (): void => this.act(() => (this.loc.pathname = this.paths.pop() ?? "/"));
}
