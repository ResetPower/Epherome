import { configStore, setConfig } from "common/struct/config";
import { ipcRenderer } from "electron";
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
    this.current !== pathname &&
      this.history.push({ pathname, params: params ?? "" });
  }
  @action back() {
    this.history.length !== 1 && this.history.pop();
  }
  get current(): string {
    return this.history[this.history.length - 1].pathname;
  }
  get use(): Location {
    return this.history[this.history.length - 1];
  }
}

export const historyStore = new HistoryStore();

ipcRenderer.on("history-back", () => historyStore.back());

window.addEventListener("beforeunload", () => {
  if (configStore.rememberWindowSize) {
    setConfig(
      (cfg) =>
        (cfg.windowSize = {
          height: window.outerHeight,
          width: window.outerWidth,
        })
    );
  }
});
