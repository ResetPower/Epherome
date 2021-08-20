import { action, computed, makeObservable, observable } from "mobx";

export type LocationParams = Record<string, unknown>;

export interface Location {
  pathname: string;
  params: LocationParams;
}

export class HistoryStore {
  @observable
  private locations: Location[] = [];
  constructor() {
    makeObservable(this);
  }
  @action
  push = (pathname: string, params?: LocationParams): void => {
    this.locations.push({
      pathname,
      params: params ?? {},
    });
  };
  @action
  back = (): void => {
    this.locations.length > 1 && this.locations.pop();
  };
  @computed
  get isEmpty(): boolean {
    return this.locations.length === 0;
  }
  @computed
  get current(): Location | undefined {
    return [...this.locations].pop();
  }
  @computed
  get pathname(): string {
    return this.current?.pathname ?? "";
  }
}

export const historyStore = new HistoryStore();
