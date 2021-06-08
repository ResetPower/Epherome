import { ReactNode } from "react";
import Typography from "./Typography";

export default function Alert(props: {
  children: ReactNode;
  severity: "info" | "warn" | "error";
}): JSX.Element {
  return (
    <div
      className={`bg-opacity-60 text-white rounded-md text-base p-3 ${
        props.severity === "warn"
          ? "bg-yellow-400"
          : props.severity === "error"
          ? "bg-red-400"
          : "bg-blue-400"
      }`}
    >
      <Typography>{props.children}</Typography>
    </div>
  );
}
