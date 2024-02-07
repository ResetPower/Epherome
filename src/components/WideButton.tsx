import { MouseEventHandler, ReactNode } from "react";
import { concat } from "../utils";

export default function WideButton(props: {
  className?: string;
  onClick?: MouseEventHandler;
  children: ReactNode;
}) {
  return (
    <button
      className={concat(
        props.className,
        "flex items-center p-2 transition-colors text-blue-500 hover:text-blue-600"
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
