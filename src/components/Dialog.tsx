import { ReactNode } from "react";

export default function Dialog(props: {
  children: ReactNode;
  indentBottom?: boolean;
}): JSX.Element {
  return (
    <div
      className={`justify-center p-6 mx-auto my-auto shadow-xl rounded-lg bg-card eph-dialog ${
        props.indentBottom ? "pb-4" : ""
      }`}
    >
      {props.children}
    </div>
  );
}
