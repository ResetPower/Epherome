import { Component } from "react";
import { unwrapFunction } from "../tools";
import { DefaultFunction, StringMap } from "../tools/types";
import { EphHistory, Location } from "./history";

export interface Route {
  component: ((params: StringMap) => JSX.Element) | JSX.Element;
  path: string;
  class?: string;
  params?: string | number[];
}

export interface RouterProps {
  routes: Route[];
  history: EphHistory;
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
      this.setState({ location: hist.location, mainClassName: "fade-exit" });
      unwrapFunction(this.props.onChange)();
    });
    hist.listenAnime(() => this.setState({ mainClassName: "fade-enter" }));
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
    return <div className={this.state.mainClassName}>{child}</div>;
  }
}
