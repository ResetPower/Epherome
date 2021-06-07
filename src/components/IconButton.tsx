import { ReactNode } from "react";

export default function IconButton(props: {
  children: ReactNode;
  onClick?: () => void;
}): JSX.Element {
  return (
    <button
      className="rounded-full h-12 w-12 flex items-center justify-center border-none bg-transparent hover:bg-black hover:bg-opacity-5 mx-auto my-auto ml-4 text-black cursor-pointer"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
