import { MouseEventHandler, ReactNode } from "react";
import { concat } from "../utils";

export type ButtonType = "submit" | "reset" | "button" | undefined;

export default function Button(props: {
  className?: string;
  type?: ButtonType;
  onClick?: MouseEventHandler;
  primary?: boolean;
  dangerous?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      className={concat(
        props.className,
        "flex items-center py-1 px-3 text-sm font-medium rounded transition-colors whitespace-nowrap",
        props.primary
          ? "text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
          : props.dangerous
            ? "text-white bg-red-500 hover:bg-red-600 active:bg-red-700"
            : "border hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600",
        props.disabled && "cursor-not-allowed"
      )}
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
