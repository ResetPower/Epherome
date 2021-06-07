import { ReactNode } from "react";

export default function Button(props: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "contained" | "outlined" | "default";
}): JSX.Element {
  return (
    <button
      disabled={props.disabled === undefined ? false : props.disabled}
      className={
        "flex p-2 cursor-pointer active:shadow-md rounded-md text-base m-1 px-4 " +
        (props.variant === "outlined" ? "border-solid border " : " border-none ") +
        (props.variant === "contained"
          ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white "
          : "bg-transparent hover:bg-black hover:bg-opacity-5 ")
      }
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
