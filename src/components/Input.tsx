import {
  HTMLInputTypeAttribute,
  LegacyRef,
  ReactNode,
  forwardRef,
} from "react";
import { concat } from "../utils";

const Input = forwardRef(
  (
    props: {
      name?: string;
      label?: string;
      placeholder?: string;
      helper?: string;
      type?: HTMLInputTypeAttribute;
      required?: boolean;
      trailing?: ReactNode;
      largeLabel?: boolean;
    },
    ref?: LegacyRef<HTMLInputElement>
  ) => {
    return (
      <div>
        {props.label && (
          <label
            className={concat(
              "block font-medium text-gray-800",
              props.largeLabel ? "text-lg" : "text-sm"
            )}
            htmlFor={props.name}
          >
            {props.label}
          </label>
        )}
        <div className="flex items-center space-x-1">
          <input
            className={concat(
              "flex-grow block w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600",
              "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 ",
              "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            )}
            name={props.name}
            ref={ref}
            type={props.type}
            placeholder={props.placeholder}
            required={props.required}
          />
          {props.trailing}
        </div>
        {props.helper && (
          <div className="text-gray-500 text-sm">{props.helper}</div>
        )}
      </div>
    );
  }
);

export default Input;
