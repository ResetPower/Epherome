import { MdWarning } from "react-icons/md";

export default function Alert(props: { children: string }) {
  return (
    <div className="flex items-center space-x-2 rounded bg-red-100 dark:bg-red-900 p-3">
      <MdWarning className="text-xl text-red-500 dark:text-red-300" />
      <div className="text-sm">{props.children}</div>
    </div>
  );
}
