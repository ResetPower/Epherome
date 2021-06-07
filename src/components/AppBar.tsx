import { ReactNode } from "react";

export default function AppBar(props: { children: ReactNode }): JSX.Element {
  return <div className="bg-blue-500 flex mb-3">{props.children}</div>;
}
