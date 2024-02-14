import { MouseEventHandler, ReactNode } from "react";
import { concat } from "../utils";

export default function ListTile(props: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  onClick?: MouseEventHandler;
}) {
  return (
    <button
      onClick={props.onClick}
      className={concat(
        props.className,
        "flex rounded p-2 w-full text-sm font-medium transition-colors",
        props.active && "bg-gray-200 dark:bg-gray-700",
        "hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600"
      )}
    >
      {props.children}
    </button>
  );
}
