import { DefaultFunction } from "../tools/types";
import Typography from "./Typography";

export default function ListItemText(props: {
  primary?: string;
  secondary?: string;
  className?: string;
  onClick?: DefaultFunction;
}): JSX.Element {
  return (
    <div className={props.className} onClick={props.onClick}>
      <Typography>{props.primary ?? ""}</Typography>
      <p className="text-shallow">{props.secondary ?? ""}</p>
    </div>
  );
}
