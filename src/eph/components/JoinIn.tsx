import { ReactNode } from "react";

export default function JoinIn(props: {
  children: ReactNode[];
  separator: ReactNode;
}): JSX.Element {
  if (props.children.length === 0) {
    return <></>;
  }
  return (
    <>
      {props.children.reduce((prev, curr) => (
        <>
          {prev}
          {props.separator}
          {curr}
        </>
      ))}
    </>
  );
}
