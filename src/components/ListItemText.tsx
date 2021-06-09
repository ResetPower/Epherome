import Typography from "./Typography";

export default function ListItemText(props: {
  primary?: string;
  secondary?: string;
  className?: string;
}): JSX.Element {
  return (
    <div className={props.className}>
      <Typography>{props.primary}</Typography>
      <p className="text-shallow">{props.secondary}</p>
    </div>
  );
}
