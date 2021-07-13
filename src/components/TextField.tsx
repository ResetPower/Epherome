import { unwrapFunction } from "../tools";

export default function TextField(props: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (text: string) => void;
  icon?: JSX.Element;
  type?: string;
  helperText?: string;
  error?: boolean;
  marginBottom?: boolean;
}): JSX.Element {
  return (
    <div className={props.marginBottom ? "mb-3" : ""}>
      {props.label && (
        <label className="text-gray-600 dark:text-gray-400 leading-7 text-sm font-bold">
          {props.label}
        </label>
      )}
      <div className="flex">
        {props.icon && (
          <div className="rounded-l-md inline-flex items-center px-3 border-t bg-white dark:bg-gray-700 border-l border-b border-divide text-shallow shadow-sm">
            {props.icon}
          </div>
        )}
        <input
          type={props.type}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(ev) => unwrapFunction(props.onChange)(ev.currentTarget.value)}
          className={`${
            props.icon ? "rounded-r-lg" : "rounded-lg"
          } flex-1 appearance-none border border-divide w-full py-2 px-4 bg-card text-gray-700 dark:text-gray-50 placeholder-gray-400 shadow-sm text-base focus:outline-none ${
            props.error
              ? "ring ring-red-500"
              : "focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
          }`}
        ></input>
      </div>
      {props.helperText && (
        <p className={`text-sm ${props.error ? "text-red-500" : "text-shallow"} -bottom-6`}>
          {props.helperText}
        </p>
      )}
    </div>
  );
}
