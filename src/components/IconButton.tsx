import { ReactNode } from "react";

export default function IconButton(props: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  textInherit?: boolean;
}): JSX.Element {
  return (
    <button
      className={`rounded-full ${
        props.textInherit ? "" : "text-black dark:text-white"
      } focus:outline-none h-12 w-12 flex items-center justify-center transition-colors duration-200 transform hover:bg-black hover:bg-opacity-5 active:bg-opacity-10 ${
        props.className
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
