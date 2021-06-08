import { ReactNode } from "react";

export default function AppBar(props: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div className={`bg-primary shadow-lg flex py-2 items-center ${props.className}`}>
      {props.children}
    </div>
  );
}
