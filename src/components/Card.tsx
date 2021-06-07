import { ReactNode } from "react";

export default function Card(props: {
  children: ReactNode;
  variant?: string;
  className?: string;
}): JSX.Element {
  return <div className={`border ${props.className}`}>{props.children}</div>;
}
