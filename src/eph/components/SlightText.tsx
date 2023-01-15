import { DefaultFn } from "common/utils";

export default function SlightText(props: {
  onClick?: DefaultFn;
  className?: string;
  children: string;
}): JSX.Element {
  return (
    <div
      className={`select-none cursor-pointer hover:text-stone-700 active:text-stone-600 dark:hover:text-stone-200 dark:active:text-stone-300 transition-colors duration-300 ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
