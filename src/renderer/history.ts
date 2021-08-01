import { DefaultFn, StringMap, unwrapFunction } from "../tools";

export interface Location {
  pathname: string;
  params: StringMap;
}

export class HistoryStore {
  private locations: Location[] = [];
  private listener: DefaultFn = unwrapFunction();
  listen(listener: DefaultFn): void {
    this.listener = listener;
  }
  push = (pathname: string, params?: StringMap): void => {
    this.locations.push({ pathname, params: params ?? {} });
    this.listener();
  };
  back = (): void => {
    this.locations.length > 0 && this.locations.pop();
    this.listener();
  };
  dispatch = (): void => {
    this.listener();
  };
  get isEmpty(): boolean {
    return this.locations.length === 0;
  }
  get current(): Location | undefined {
    return [...this.locations].pop();
  }
}

export const historyStore = new HistoryStore();
