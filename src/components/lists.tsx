import { ReactNode } from "react";
import { DefaultFunction } from "../tools/types";
import { Typography } from "./layouts";

export function List(props: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={`space-y-1 ${props.className ?? ""}`}>{props.children}</div>
  );
}

export function ListItem(props: {
  children: ReactNode;
  className?: string;
  checked?: boolean;
  onClick?: DefaultFunction;
}): JSX.Element {
  return (
    <div
      className={`flex p-1 ${
        props.onClick
          ? "select-none cursor-pointer transition-colors duration-200 transform bg-black bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20"
          : ""
      } ${props.className ?? ""} ${props.checked ? "bg-opacity-10" : ""}`}
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
  longSecondary?: boolean;
}): JSX.Element {
  return (
    <div className={props.className ?? ""}>
      <Typography>{props.primary ?? ""}</Typography>
      <p
        className={`text-shallow ${
          props.longSecondary ? "overflow-ellipsis" : ""
        }`}
        title={props.longSecondary ? props.secondary : undefined}
      >
        {props.secondary ?? ""}
      </p>
    </div>
  );
}
