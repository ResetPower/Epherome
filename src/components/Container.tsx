import { ReactNode } from "react";

export default function Container(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`container mx-auto ${props.className}`}>{props.children}</div>;
}
