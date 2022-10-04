import { DefaultFn } from "common/utils";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

export default function RadioButton(props: {
  active?: boolean;
  onClick?: DefaultFn;
}) {
  return (
    <div
      className="text-sky-400 hover:text-sky-500 cursor-pointer"
      onClick={props.onClick}
    >
      {props.active ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />}
    </div>
  );
}
