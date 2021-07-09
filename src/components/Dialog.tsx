import { ReactNode } from "react";

export default function Dialog(props: {
  children: ReactNode;
  indentBottom?: boolean;
}): JSX.Element {
  return (
    <div
      className={`p-6 w-full shadow-xl rounded-lg bg-card animate__animated animate__zoomIn eph-dialog ${
        props.indentBottom ? "pb-4" : ""
      }`}
    >
      {props.children}
    </div>
  );
}
