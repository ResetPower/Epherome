import { ComponentClass, ReactNode } from "react";
import { hist } from "../renderer/global";

interface WithParams {
  params: { [key: string]: string };
}

interface RouteObject {
  props: {
    path: string;
    component: ComponentClass<WithParams>;
  };
}

// simple router toolkit
export default function Router(props: { children: ReactNode[] }): JSX.Element {
  if (props.children) {
    for (const i of props.children) {
      const obj = i as RouteObject;
      if (hist.pathname() === obj.props.path) {
        return <obj.props.component params={hist.loc.params} />;
      }
    }
  }
  return <div></div>; // default value when no route matches
}
