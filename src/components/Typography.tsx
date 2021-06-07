import { ReactNode } from "react";

export default function Typography(props: { children: ReactNode; variant?: string }): JSX.Element {
  return <p>{props.children}</p>;
}
