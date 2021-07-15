import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { unwrapFunction } from "../tools";

export default function Radio(props: {
  checked: boolean;
  className?: string;
  onChange?: (value: boolean) => void;
}): JSX.Element {
  const className = `select-none text-secondary cursor-pointer bg-opacity-20 transition-colors duration-200 transform hover:bg-yellow-100 dark:hover:bg-yellow-900 active:bg-yellow-200 dark:active:bg-yellow-800 rounded-full p-1 ${props.className}`;
  const onClick = () => unwrapFunction(props.onChange)(!props.checked);
  return props.checked ? (
    <MdRadioButtonChecked className={className} onClick={onClick} size="2rem" />
  ) : (
    <MdRadioButtonUnchecked className={className} onClick={onClick} size="2rem" />
  );
}
