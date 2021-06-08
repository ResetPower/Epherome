import { ReactNode } from "react";
import Typography from "./Typography";

export default function ListItemText(props: {
  primary?: string;
  secondary?: string;
  className?: string;
}): JSX.Element {
  return (
    <div className={props.className}>
      <Typography>{props.primary}</Typography>
      <p className="text-gray-500">{props.secondary}</p>
    </div>
  );
}
