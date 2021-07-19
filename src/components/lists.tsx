import { ReactNode } from "react";
import { DefaultFunction } from "../tools/types";
import { Typography } from "./layouts";

export function List(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`space-y-1 ${props.className}`}>{props.children}</div>;
}

export function ListItem(props: {
  children: ReactNode;
  className?: string;
  checked?: boolean;
  onClick?: DefaultFunction;
}): JSX.Element {
  return (
    <div
      className={`flex p-1 select-none cursor-pointer transition-colors duration-200 transform hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        props.className
      } ${props.checked ? "bg-gray-200 dark:bg-gray-700" : ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
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
