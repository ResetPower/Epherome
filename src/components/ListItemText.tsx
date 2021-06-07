import { ReactNode } from "react";

export default function ListItemText(props: { primary?: string; secondary?: string }): JSX.Element {
  return (
    <div>
      <span>{props.primary}</span>
      <br />
      <span className="text-gray-500">{props.secondary}</span>
    </div>
  );
}
