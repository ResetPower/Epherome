import { Component, ReactNode } from "react";
import { StringMap } from "./i18n";
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
  children: ReactNode[];
  history: EphHistory;
}> {
  render(): JSX.Element | undefined {
    if (this.props.children) {
      for (const i of this.props.children) {
        const obj = i as {
          props: RouteProps;
        };
        if (this.props.history.pathname() === obj.props.path) {
          const comp = obj.props.component;
          if (typeof comp === "object") {
            return comp;
          } else if (typeof comp === "function") {
            return comp(this.props.history.loc.params);
          }
        }
      }
    }
    return undefined; // when no route matches
  }
}
