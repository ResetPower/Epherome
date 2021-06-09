import { Component, ReactNode } from "react";
import { hist } from "../renderer/global";
import { RouteProps } from "./Route";
import { subscribe } from "../renderer/session";

interface RouteObject {
  props: RouteProps;
}

export interface RouterProps {
  children: ReactNode[];
  animateClassNames: string;
}

// simple router toolkit
export default class Router extends Component<RouterProps> {
  constructor(props: RouterProps) {
    super(props);
    subscribe("anm", () => {
      console.log("anm received");
    });
  }
  render(): JSX.Element {
    if (this.props.children) {
      for (const i of this.props.children) {
        const obj = i as RouteObject;
        if (hist.pathname() === obj.props.path) {
          return obj.props.component(hist.loc.params);
        }
      }
    }
    return <></>; // default value when no route matches
  }
}
