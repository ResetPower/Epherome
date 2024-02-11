import { concat } from "../utils";

export default function Checkbox(props: {
  children?: string;
  name?: string;
  value?: boolean;
  onChange?: (newValue: boolean) => unknown;
}) {
  return (
    <div className="flex items-center mb-4">
      <input
        type="checkbox"
        name={props.name}
        checked={props.value}
        onChange={(e) => {
          if (props.onChange) props.onChange(e.target.checked);
        }}
        className={concat(
          "w-4 h-4 rounded",
          "text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600",
          "focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
        )}
      />
      <div className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {props.children}
      </div>
    </div>
  );
}
