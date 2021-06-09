import { Component, ReactNode } from "react";
import { hist } from "../renderer/global";
import { RouteProps } from "./Route";

interface RouteObject {
  props: RouteProps;
}

export interface RouterProps {
  children: ReactNode[];
}

// simple router toolkit
export default class Router extends Component<RouterProps> {
  constructor(props: RouterProps) {
    super(props);
  }
  render(): JSX.Element {
    if (this.props.children) {
      for (const i of this.props.children) {
        const obj = i as RouteObject;
        if (hist.pathname() === obj.props.path) {
          const component = obj.props.component(hist.loc.params);
          return component;
        }
      }
    }
    return <></>; // default value when no route matches
  }
}
