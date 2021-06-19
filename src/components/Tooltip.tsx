import { ReactNode } from "react";

export default function Tooltip(props: { children: ReactNode; title: string }): JSX.Element {
  return (
    <div className="relative flex flex-col items-center group">
      <div>{props.children}</div>
      <div className="absolute bottom-0 flex-col items-center hidden mb-12 group-hover:flex">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap rounded-md bg-black shadow-lg">
          {props.title}
        </span>
      </div>
    </div>
  );
}
