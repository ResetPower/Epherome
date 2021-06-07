import { ReactNode } from "react";

export default function Grid(props: {
  container?: boolean;
  item?: boolean;
  spacing?: number;
  xs?: number;
  children: ReactNode;
}): JSX.Element {
  return <div>{props.children}</div>;
}
