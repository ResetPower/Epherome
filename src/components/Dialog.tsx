import { ReactNode } from "react";

export default function Dialog(props: { children: ReactNode }) {
  return (
    <div
      className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl`}
    >
      {props.children}
    </div>
  );
}
