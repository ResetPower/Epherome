export default function Icon(props: {
  children: string;
  variant?: "default" | "outlined" | "round" | "sharp" | "two-tone";
}): JSX.Element {
  return (
    <i
      className={
        props.variant === undefined || props.variant === "default"
          ? "material-icons"
          : `material-icons-${props.variant}`
      }
    >
      {props.children}
    </i>
  );
}
