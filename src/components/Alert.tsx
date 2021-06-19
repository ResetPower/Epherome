import { ReactNode } from "react";
import Icon from "./Icon";
import Typography from "./Typography";

export default function Alert(props: {
  children: ReactNode;
  severity: "info" | "warn" | "error";
}): JSX.Element {
  return (
    <div
      className={`flex bg-opacity-60 text-white shadow-md rounded-md text-base p-3 ${
        props.severity === "warn"
          ? "bg-yellow-600"
          : props.severity === "error"
          ? "bg-red-600"
          : "bg-blue-600"
      }`}
    >
      <Icon>
        {props.severity === "warn" ? "warning" : props.severity === "error" ? "error" : "info"}
      </Icon>
      <Typography className="pl-3" textInherit>
        {props.children}
      </Typography>
    </div>
  );
}
