import { DefaultFn } from "common/utils";
import { ReactNode } from "react";

export default function TinyButton(props: {
  children: ReactNode;
  className?: string;
  onClick?: DefaultFn;
}) {
  return (
    <div
      className={`rcs-hover text-sm select-none rounded-md flex items-center cursor-pointer border border-divider px-2 ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
