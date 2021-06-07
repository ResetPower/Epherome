import { ReactNode } from "react";

export default function Alert(props: { children: ReactNode; severity: "info" | "warn" | "error" }) {
  return (
    <div
      className={`bg-opacity-75 text-white rounded-md p-4 ${
        props.severity === "warn"
          ? "bg-yellow-400"
          : props.severity === "error"
          ? "bg-red-400"
          : "bg-blue-400"
      }`}
    >
      {props.children}
    </div>
  );
}
