import { ReactNode } from "react";

export default function ListItemTrailing(props: { children: ReactNode }) {
  return <div className="flex self-end">{props.children}</div>;
}
