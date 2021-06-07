export default function TextField(props: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: any;
  variant?: string;
  type?: string;
  helperText?: string;
  error?: boolean;
}): JSX.Element {
  return (
    <input
      aria-label={props.label}
      placeholder={props.placeholder}
      value={props.value}
      type={props.type}
      onChange={props.onChange}
    />
  );
}
