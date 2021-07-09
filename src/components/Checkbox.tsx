import Typography from "./Typography";

export default function Checkbox(props: {
  children: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div className="flex items-center">
      <div className="bg-white border-2 rounded border-gray-400 w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500">
        <input
          type="checkbox"
          className="opacity-0 absolute"
          checked={props.checked}
          onChange={(ev) =>
            (
              props.onChange ??
              (() => {
                /**/
              })
            )(ev.currentTarget.checked)
          }
        />
        <svg
          className={`fill-current w-3 h-3 text-blue-500 pointer-events-none ${
            props.checked ? "" : "hidden"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      </div>
      <Typography>{props.children}</Typography>
    </div>
  );
}
