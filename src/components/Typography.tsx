import { ReactNode } from "react";

export default function Typography(props: {
  children: ReactNode;
  className?: string;
  textInherit?: boolean;
}): JSX.Element {
  return (
    <p className={`${props.textInherit ? "" : "text-black dark:text-white"} ${props.className}`}>
      {props.children}
    </p>
  );
}
