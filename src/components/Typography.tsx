import { ReactNode } from "react";

export default function Typography(props: { children: ReactNode; className?: string }) {
  return <p className={`text-text ${props.className}`}>{props.children}</p>;
}
