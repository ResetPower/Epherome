import { unwrapFunction } from "../tools/objects";

export default function Radio(props: {
  checked: boolean;
  className?: string;
  onChange?: (value: boolean) => void;
}): JSX.Element {
  return (
    <i
      className={`material-icons select-none text-pink-500 cursor-pointer bg-opacity-20 transition-colors duration-200 transform hover:bg-yellow-100 dark:hover:bg-yellow-900 active:bg-yellow-200 dark:active:bg-yellow-800 rounded-full p-1 ${props.className}`}
      onClick={() => unwrapFunction(props.onChange)(!props.checked)}
    >
      {props.checked ? "radio_button_checked" : "radio_button_unchecked"}
    </i>
  );
}
