import { RouteName } from "./map";

type ChangeRouteCallback = (newRoute: RouteName) => unknown;

class HistoryStore {
  fn?: ChangeRouteCallback;
  location: RouteName = "home";
  subscribe = (fn: ChangeRouteCallback) => {
    this.fn = fn;
  };
  go = (newRoute: RouteName) => {
    this.location = newRoute;
    this.fn && this.fn(newRoute);
  };
}

export const historyStore = new HistoryStore();
