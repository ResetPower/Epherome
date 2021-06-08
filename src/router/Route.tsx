import { ComponentClass } from "react";

// route component
export default function Route(_props: {
  component: ComponentClass<any, any>;
  path: string;
  params?: string | number[];
}): JSX.Element {
  return <></>;
}
