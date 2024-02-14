import { ReactNode } from "react";
import { concat } from "../utils";

export default function Shallow(props: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={concat(props.className, "text-gray-500 dark:text-gray-400")}
    >
      {props.children}
    </div>
  );
}
