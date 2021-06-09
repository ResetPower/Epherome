import { broadcast } from "../renderer/session";
import { StringMap } from "../tools/i18n";

export interface EphLocation {
  pathname: string;
  params: StringMap;
}

export class EphHistory {
  loc = { pathname: "/", params: {} };
  paths = ["/"];
  // the only instance of EphHistory
  static inst = new EphHistory();
  private constructor() {
    /* */
  }
  private invokeListeners() {
    // broadcast title update message
    broadcast("hist", inst.loc.pathname);
  }
  pathname(): string {
    return inst.loc.pathname;
  }
  push(pathname: string, params: StringMap = {}): void {
    inst.paths.push(inst.pathname());
    inst.loc.pathname = pathname;
    inst.loc.params = params;
    inst.invokeListeners();
  }
  replace(pathname: string, params: StringMap = {}): void {
    inst.loc.pathname = pathname;
    inst.loc.params = params;
    inst.invokeListeners();
  }
  goBack(): void {
    inst.loc.pathname = inst.paths.pop() ?? "/";
    inst.invokeListeners();
  }
}

const inst = EphHistory.inst;

export function getEphHistory(): EphHistory {
  return inst;
}
