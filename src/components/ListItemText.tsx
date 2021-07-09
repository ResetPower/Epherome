import Typography from "./Typography";

export default function ListItemText(props: {
  primary?: string;
  secondary?: string;
  className?: string;
  onClick?: () => void;
}): JSX.Element {
  return (
    <div className={props.className} onClick={props.onClick}>
      <Typography>{props.primary ?? ""}</Typography>
      <p className="text-shallow">{props.secondary ?? ""}</p>
    </div>
  );
}
