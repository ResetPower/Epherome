import { ChangeEvent, ReactNode } from "react";

export default function Select(props: {
  value: string | number;
  onChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <select
      className="border border-divide text-text p-2 rounded-md bg-card focus:outline-none"
      value={props.value}
      onChange={props.onChange}
    >
      {props.children}
    </select>
  );
}
