import { ReactNode } from "react";

export default function Tooltip(props: {
  children: ReactNode;
  title: string;
  direction?: "top" | "left";
}): JSX.Element {
  return (
    <div className="relative flex flex-col items-center rounded-full group">
      {props.children}
      <div
        className={`absolute select-none bottom-0 flex-col items-center hidden ${
          props.direction === "left" ? "mr-24" : "mb-12"
        } group-hover:flex`}
      >
        <span className="relative z-10 p-2 text-xs leading-none text-white bg-gray-800 whitespace-no-wrap rounded-md shadow-lg">
          {props.title}
        </span>
      </div>
    </div>
  );
}
