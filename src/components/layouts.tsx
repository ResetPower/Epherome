import { ReactNode } from "react";
import { MdError, MdInfo, MdWarning } from "react-icons/md";

export function Alert(props: {
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
      {props.severity === "warn" ? (
        <MdWarning />
      ) : props.severity === "error" ? (
        <MdError />
      ) : (
        <MdInfo />
      )}
      <Typography className="pl-3" textInherit>
        {props.children}
      </Typography>
    </div>
  );
}

export function Container(props: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`container mx-auto ${props.className}`}>{props.children}</div>;
}

export function Card(props: {
  children: ReactNode;
  className?: string;
  variant?: "outlined" | "contained";
}): JSX.Element {
  return (
    <div
      className={`${
        props.variant === "contained" ? "shadow-md" : "border border-divide"
      } p-3 bg-card rounded-lg ${props.className}`}
    >
      {props.children}
    </div>
  );
}

export function Typography(props: {
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

export function Tooltip(props: { children: ReactNode; title: string }): JSX.Element {
  return (
    <div className="relative flex flex-col items-center rounded-full group">
      {props.children}
      <span className="z-10 p-2 select-none fixed mt-12 text-xs leading-none text-white bg-gray-800 rounded-md shadow-lg hidden group-hover:flex">
        {props.title}
      </span>
    </div>
  );
}
