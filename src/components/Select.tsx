import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import Button from "./Button";
import { Fragment, useState } from "react";
import { concat } from "../utils";

export default function Select(props: {
  className?: string;
  options: { [key: string]: string };
  value: string;
  onChange: (newValue: string) => unknown;
}) {
  const [state, setState] = useState(false);
  const toggleState = () => setState((prev) => !prev);

  const onSelect = (key: string) => {
    props.onChange(key);
    toggleState();
  };

  return (
    <Fragment>
      <Button className={props.className} onClick={toggleState}>
        {props.options[props.value]}{" "}
        {state ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />}
      </Button>
      <div
        className={concat(
          "z-10 bg-white divide-y divide-gray-100 rounded-lg border w-44 dark:bg-gray-700",
          state ? "absolute" : "hidden"
        )}
      >
        <div className="py-2 text-sm text-gray-700 dark:text-gray-200">
          {Object.entries(props.options).map(([key, value], ind) => (
            <button
              key={ind}
              onClick={() => onSelect(key)}
              className={concat(
                "px-4 py-2 w-full block text-left",
                "hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white",
                props.value === key && "bg-gray-100"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
