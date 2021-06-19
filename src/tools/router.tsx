import { Component } from "react";
import { StringMap } from "./types";
import { EphHistory } from "./history";

export interface RouteProps {
  component: ((params: StringMap) => JSX.Element) | JSX.Element;
  path: string;
  className?: string;
  params?: string | number[];
}

// route component
export function Route(_props: RouteProps): null {
  return null;
}

// simple router toolkit
export class Router extends Component<{
  children: {
    props: RouteProps;
  }[];
  history: EphHistory;
}> {
  render(): JSX.Element | undefined {
    if (this.props.children) {
      for (const i of this.props.children) {
        if (this.props.history.pathname() === i.props.path) {
          // route matched
          const comp = i.props.component;
          if (typeof comp === "object") {
            // component without params
            return comp;
          } else if (typeof comp === "function") {
            // component with params
            return comp(this.props.history.loc.params);
          }
        }
      }
    }
    return undefined; // when no route matches
  }
}
