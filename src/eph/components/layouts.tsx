import { DefaultFn } from "common/utils";
import { ReactNode } from "react";
import { MdCheck, MdClose, MdError, MdInfo, MdWarning } from "react-icons/md";

export function Alert(props: {
  children: ReactNode;
  className?: string;
  severity: "info" | "warn" | "error" | "successful";
  onClose?: DefaultFn;
}): JSX.Element {
  return (
    <div
      className={`flex items-center bg-opacity-60 text-white shadow-md rounded-md text-base p-3 ${
        props.severity === "successful"
          ? "bg-green-500"
          : props.severity === "warn"
          ? "bg-yellow-600"
          : props.severity === "error"
          ? "bg-red-600"
          : "bg-blue-600"
      } ${props.className}`}
    >
      {props.severity === "successful" ? (
        <MdCheck />
      ) : props.severity === "warn" ? (
        <MdWarning />
      ) : props.severity === "error" ? (
        <MdError />
      ) : (
        <MdInfo />
      )}
      <p className="pl-3 text-white flex-grow">{props.children}</p>
      {props.onClose && (
        <MdClose
          className="hover:opacity-80 active:opacity-60 cursor-pointer transition-colors"
          onClick={props.onClose}
        />
      )}
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
