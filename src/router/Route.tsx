import { ComponentClass, PureComponent } from "react";

export default class Route extends PureComponent<
  {
    component: ComponentClass<any, any>;
    path: string;
    params?: string | number[];
  },
  Record<string, unknown>
> {}
