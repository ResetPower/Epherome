import { MouseEventHandler, ReactNode } from "react";
import { concat } from "../utils";

export default function IconButton(props: {
  children: ReactNode;
  onClick?: MouseEventHandler;
  active?: boolean;
}) {
  return (
    <button
      className={concat(
        "rounded p-1 transition-colors hover:bg-gray-100 active:bg-gray-200",
        props.active && "bg-gray-100"
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
