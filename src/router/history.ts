import { broadcast } from "../renderer/session";
import { StringMap } from "../tools/i18n";

export interface EphLocation {
  pathname: string;
  params: StringMap;
}

export class EphHistory {
  loc = { pathname: "/", params: {} };
  paths = ["/"];
  // animation lasts 100 ms
  animationTimeout = 100;
  // the only instance of EphHistory
  static inst = new EphHistory();
  private constructor() {
    /* */
  }
  private invokeListeners() {
    // broadcast title update message
    broadcast("hist", inst.loc.pathname);
  }
  private invokeAnimationListeners() {
    // broadcast animation start message to let App component add 'fade-enter' to div main
    broadcast("anm");
  }
  pathname(): string {
    return inst.loc.pathname;
  }
  push(pathname: string, params: StringMap = {}): void {
    inst.invokeAnimationListeners();
    setTimeout(() => {
      inst.paths.push(inst.pathname());
      inst.loc.pathname = pathname;
      inst.loc.params = params;
      inst.invokeListeners();
    }, inst.animationTimeout);
  }
  replace(pathname: string, params: StringMap = {}): void {
    inst.invokeAnimationListeners();
    setTimeout(() => {
      inst.loc.pathname = pathname;
      inst.loc.params = params;
      inst.invokeListeners();
    }, inst.animationTimeout);
  }
  goBack(): void {
    inst.invokeAnimationListeners();
    setTimeout(() => {
      inst.loc.pathname = inst.paths.pop() ?? "/";
      inst.invokeListeners();
    }, inst.animationTimeout);
  }
}

const inst = EphHistory.inst;

export function getEphHistory(): EphHistory {
  return inst;
}
