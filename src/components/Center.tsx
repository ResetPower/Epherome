import { ReactNode } from "react";
import { concat } from "../utils";

export default function Center(props: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={concat(props.className, "grid place-items-center h-full")}>
      {props.children}
    </div>
  );
}
