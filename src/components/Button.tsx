import { ReactNode } from "react";

export default function Button(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  textInherit?: boolean;
  variant?: "contained" | "outlined" | "default";
}): JSX.Element {
  return (
    <button
      disabled={props.disabled === undefined ? false : props.disabled}
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium m-1 focus:outline-none
        ${
          props.variant === "contained"
            ? "transition-colors duration-200 transform bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white" // contained style
            : props.variant === "outlined"
            ? "shadow-sm border bg-gray-500 transition-colors duration-200 transform bg-opacity-0 hover:bg-opacity-5 active:bg-opacity-10" // outlined style
            : `bg-gray-500 transition-colors duration-200 transform bg-opacity-0 hover:bg-opacity-5 active:bg-opacity-10 ${
                props.textInherit ? "" : "text-black dark:text-white"
              }` // default style (text button)
        }
        ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
