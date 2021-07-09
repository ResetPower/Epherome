import { ReactNode } from "react";

export default function Select(props: {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <select
      className="border border-divide select-none text-black dark:text-white p-2 rounded-md bg-card focus:outline-none"
      value={props.value}
      onChange={(ev) => {
        props.onChange(ev.currentTarget.value);
      }}
    >
      {props.children}
    </select>
  );
}
