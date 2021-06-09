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
    <div>
      {props.label && (
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
          {props.label}
        </label>
      )}
      <input
        type={props.type}
        className={`focus:outline-none border ${
          props.error ? "border-red-500" : "border-divide"
        } bg-card text-black dark:text-white rounded-md w-full p-1`}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}
