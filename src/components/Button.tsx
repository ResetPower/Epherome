import { ReactNode } from "react";
import { DefaultFunction } from "../tools/types";

export default function Button(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: DefaultFunction;
  textInherit?: boolean;
  variant?: "contained" | "default";
}): JSX.Element {
  return (
    <button
      disabled={props.disabled ?? false}
      type="button"
      className={`flex select-none items-center px-4 py-2 rounded-md text-sm font-medium m-1 focus:outline-none
        ${
          props.variant === "contained"
            ? `text-white ${
                props.disabled
                  ? "bg-gray-700 text-gray-200"
                  : "transition-colors duration-200 transform bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              }` // eph-btn-contained
            : `bg-gray-500 bg-opacity-0 ${
                props.disabled
                  ? ""
                  : "transition-colors duration-200 transform hover:bg-opacity-5 active:bg-opacity-10"
              } ${props.textInherit ? "" : "text-black dark:text-white"}` // eph-btn-text
        }
        ${props.disabled ? "cursor-not-allowed text-gray-500 dark:text-gray-500" : ""}
        ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
