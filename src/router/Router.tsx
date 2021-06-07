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

export default function Router(props: { children: ReactNode[] }): JSX.Element {
  if (props.children) {
    for (const i of props.children) {
      const obj = i as RouteObject;
      if (hist.pathname() === obj.props.path) {
        return <obj.props.component params={hist.location.params} />;
      }
    }
  }
  return <div></div>;
}
