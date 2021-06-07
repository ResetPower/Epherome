import { ReactNode } from "react";

export default function List(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`space-y-4 ${props.className}`}>{props.children}</div>;
}
