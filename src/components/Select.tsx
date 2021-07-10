import { ReactNode } from "react";

export default function Select(props: {
  value: string | number;
  label?: string;
  onChange: (value: string) => void;
  className?: string;
  marginBottom?: boolean;
  children: ReactNode;
  disabled?: boolean;
}): JSX.Element {
  return (
    <div className={props.marginBottom ? "mb-3" : ""}>
      {props.label && <label className="text-shallow font-bold">{props.label}</label>}
      <select
        value={props.value}
        onChange={(ev) => {
          props.onChange(ev.currentTarget.value);
        }}
        className={`block py-2 px-3 bg-card text-black dark:text-white border border-divide rounded-md shadow-sm focus:outline-none ${props.className}`}
        disabled={props.disabled}
      >
        {props.children}
      </select>
    </div>
  );
}
