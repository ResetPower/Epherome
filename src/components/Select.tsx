import { ChangeEvent, ReactNode } from "react";

export default function Select(props: {
  value: string | number;
  onChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <select value={props.value} onChange={props.onChange}>
      {props.children}
    </select>
  );
}
