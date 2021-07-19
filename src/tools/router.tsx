import { Component } from "react";
import { unwrapFunction } from ".";
import { DefaultFunction, StringMap } from "./types";

export interface Route {
  component: ((params: StringMap) => JSX.Element) | JSX.Element;
  path: string;
  class?: string;
  params?: string | number[];
}

export interface RouterProps {
  routes: Route[];
  history: EphHistory;
  className?: string;
  onChange?: DefaultFunction;
}

export interface RouterState {
  location: Location;
  mainClassName: string;
}

// simple router toolkit
export class Router extends Component<RouterProps, RouterState> {
  constructor(props: RouterProps) {
    super(props);
    const hist = this.props.history;
    this.state = {
      location: hist.location,
      mainClassName: "",
    };
    hist.listen(() => {
      this.setState({ location: hist.location, mainClassName: "animate__fadeIn" });
      unwrapFunction(this.props.onChange)();
    });
    hist.listenAnime(() => this.setState({ mainClassName: "animate__fadeOut" }));
  }
  render(): JSX.Element | null {
    const loc = this.state.location;
    const route = this.props.routes.find((val) => val.path === loc.pathname);
    let child = null;
    if (route) {
      // route matched
      const comp = route.component;
      if (typeof comp === "object") {
        // component without params
        child = comp;
      } else if (typeof comp === "function") {
        // component with params
        child = comp(loc.params);
      }
    }
    return (
      <div
        className={`animate__animated ${this.state.mainClassName} ${this.props.className ?? ""}`}
      >
        {child}
      </div>
    );
  }
}

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
