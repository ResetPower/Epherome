import { concat } from "../utils";

export default function TabBar(props: {
  tabs: string[];
  value: number;
  className?: string;
  setValue: (newValue: number) => unknown;
}) {
  return (
    <div
      className={concat(
        props.className,
        "text-sm font-medium text-center border-b",
        "text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700"
      )}
    >
      {props.tabs.map((tab, ind) => (
        <button
          type="button"
          key={ind}
          onClick={() => props.setValue(ind)}
          className={concat(
            "inline-block p-4 border-b-2",
            ind === props.value
              ? "text-blue-600 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
              : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
