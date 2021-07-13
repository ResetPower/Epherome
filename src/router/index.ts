import { StringMap } from "../tools/types";
import { EphHistory } from "../tools/history";

export interface Route {
  component: ((params: StringMap) => JSX.Element) | JSX.Element;
  path: string;
  class?: string;
  params?: string | number[];
}

// simple router toolkit
export function Router(props: { routes: Route[]; history: EphHistory }): JSX.Element | null {
  for (const i of props.routes) {
    if (props.history.pathname() === i.path) {
      // route matched
      const comp = i.component;
      if (typeof comp === "object") {
        // component without params
        return comp;
      } else if (typeof comp === "function") {
        // component with params
        return comp(props.history.loc.params);
      }
    }
  }
  return null; // when no route matches
}
