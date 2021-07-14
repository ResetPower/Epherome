import { ReactNode } from "react";

export default function Tooltip(props: { children: ReactNode; title: string }): JSX.Element {
  return (
    <div className="relative flex flex-col items-center rounded-full group">
      {props.children}
      <span className="z-10 p-2 fixed mt-12 text-xs leading-none text-white bg-gray-800 rounded-md shadow-lg hidden group-hover:flex">
        {props.title}
      </span>
    </div>
  );
}
