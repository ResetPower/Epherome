export default function Radio(props: {
  checked: boolean;
  onChange: (value: boolean) => void;
}): JSX.Element {
  return (
    <i
      className="material-icons select-none text-pink-500 cursor-pointer"
      onClick={() => props.onChange(!props.checked)}
    >
      {props.checked ? "radio_button_checked" : "radio_button_unchecked"}
    </i>
  );
}
