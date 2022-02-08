import { ReactNode } from "react";

export default function JoinIn(props: {
  children: ReactNode[];
  className?: string;
  separator: ReactNode;
}): JSX.Element {
  if (props.children.length === 0) {
    return <></>;
  }
  return (
    <div className={props.className}>
      {props.children.reduce((prev, curr) => (
        <>
          {prev}
          {props.separator}
          {curr}
        </>
      ))}
    </div>
  );
}
