import { ReactNode } from "react";

export function Center(props: {
  children: ReactNode;
  className?: string;
  hFull?: boolean;
}): JSX.Element {
  return (
    <div
      className={`grid place-items-center ${props.hFull && "h-full"} ${
        props.className
      }`}
    >
      {props.children}
    </div>
  );
}

export function Info(props: {
  title: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={props.className}>
      <p className="text-shallow text-md">{props.title}</p>
      {typeof props.children === "string" ? (
        <p>{props.children}</p>
      ) : (
        props.children
      )}
    </div>
  );
}

export function WithHelper(props: {
  helper: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      {props.children}
      <p className="eph-helper-text">{props.helper}</p>
    </>
  );
}
