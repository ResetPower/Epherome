import { ReactNode } from "react";

export function BottomSheet(props: { children: ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex-grow" />
      {props.children}
    </>
  );
}
