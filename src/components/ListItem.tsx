import { ReactNode } from "react";

export default function ListItem(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`flex ${props.className}`}>{props.children}</div>;
}
