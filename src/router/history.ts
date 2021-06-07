export interface EphLocation {
  pathname: string;
  params: { [key: string]: string };
}

export type EphHistoryListener = (location: EphLocation) => void;

export class EphHistory {
  location = { pathname: "/", params: {} };
  paths = ["/"];
  listeners: EphHistoryListener[] = [];
  static inst = new EphHistory();
  private constructor() {
    /* */
  }
  private invokeListeners() {
    inst.listeners.forEach((i) => i(inst.location));
  }
  pathname(): string {
    return inst.location.pathname;
  }
  push(pathname: string, params: { [key: string]: string } = {}): void {
    inst.paths.push(inst.pathname());
    inst.location.pathname = pathname;
    inst.location.params = params;
    inst.invokeListeners();
  }
  replace(pathname: string, params: { [key: string]: string } = {}): void {
    inst.location.pathname = pathname;
    inst.location.params = params;
    inst.invokeListeners();
  }
  goBack(): void {
    inst.location.pathname = inst.paths.pop() ?? "/";
    inst.invokeListeners();
  }
  listen(listener: EphHistoryListener): void {
    inst.listeners.push(listener);
  }
}

const inst = EphHistory.inst;

export function getEphHistory(): EphHistory {
  return inst;
}
