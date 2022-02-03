import { KeyOfLanguageDefinition } from "eph/intl";
import { action, makeObservable, observable } from "mobx";

export interface Location {
  pathname: string;
  params: string;
}

export class HistoryStore {
  @observable history: Location[] = [{ pathname: "home", params: "" }];
  constructor() {
    makeObservable(this);
  }
  @action push(pathname: KeyOfLanguageDefinition, params?: string) {
    this.history.push({ pathname, params: params ?? "" });
  }
  @action back() {
    this.history.length !== 1 && this.history.pop();
  }
  get use(): Location {
    return this.history[this.history.length - 1];
  }
}

export const historyStore = new HistoryStore();
