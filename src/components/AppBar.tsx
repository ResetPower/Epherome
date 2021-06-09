import { ReactNode } from "react";

export default function AppBar(props: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div
      className={`bg-primary shadow-lg flex py-2 items-center sticky z-30 top-0 ${props.className}`}
    >
      {props.children}
    </div>
  );
}
