import { ReactNode } from "react";
import { MdError, MdInfo, MdWarning } from "react-icons/md";

export function Alert(props: {
  children: ReactNode;
  severity: "info" | "warn" | "error";
}): JSX.Element {
  return (
    <div
      className={`eph-alert ${
        props.severity === "warn"
          ? "bg-yellow-600"
          : props.severity === "error"
          ? "bg-red-600"
          : "bg-blue-600"
      }`}
    >
      {props.severity === "warn" ? (
        <MdWarning />
      ) : props.severity === "error" ? (
        <MdError />
      ) : (
        <MdInfo />
      )}
      <p className="pl-3 text-white">{props.children}</p>
    </div>
  );
}

export function Card(props: {
  children: ReactNode;
  className?: string;
  variant?: "outlined" | "contained";
}): JSX.Element {
  return (
    <div
      className={`${
        props.variant === "contained" ? "shadow-md" : "border border-divider"
      } p-3 bg-card rounded-lg ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
}
