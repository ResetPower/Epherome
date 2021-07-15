import { ReactNode } from "react";
import { DefaultFunction } from "../tools/types";
import Typography from "./Typography";

export function List(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`space-y-3 ${props.className}`}>{props.children}</div>;
}

export function ListItem(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`flex ${props.className}`}>{props.children}</div>;
}

export function ListItemText(props: {
  primary?: string;
  secondary?: string;
  className?: string;
  onClick?: DefaultFunction;
}): JSX.Element {
  return (
    <div className={props.className} onClick={props.onClick}>
      <Typography>{props.primary ?? ""}</Typography>
      <p className="text-shallow">{props.secondary ?? ""}</p>
    </div>
  );
}
