import { ReactNode } from "react";

export default function Button(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "contained" | "outlined" | "default";
}): JSX.Element {
  return (
    <button
      disabled={props.disabled === undefined ? false : props.disabled}
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium m-1 focus:outline-none
        ${
          props.variant === "contained"
            ? "bg-gray-500 transition-colors duration-200 transform bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
            : props.variant === "outlined"
            ? "shadow-sm border bg-gray-500 transition-colors duration-200 transform bg-opacity-0 hover:bg-opacity-5 active:bg-opacity-10 text-text"
            : "bg-gray-500 transition-colors duration-200 transform bg-opacity-0 hover:bg-opacity-5 active:bg-opacity-10 text-text"
        } ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
