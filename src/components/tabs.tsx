import { createContext, ReactNode, useContext, useState } from "react";
import { unwrapFunction } from "../tools";

export interface TabContext {
  value: number;
  orientation: "vertical" | "horizontal";
  setValue: (value: number) => void;
}

export const TabContext = createContext<TabContext>({
  value: 0,
  setValue: unwrapFunction(),
  orientation: "vertical",
});

export function TabController(props: {
  children: ReactNode;
  className?: string;
  orientation: "vertical" | "horizontal";
}): JSX.Element {
  const [value, setValue] = useState(0);

  return (
    <TabContext.Provider value={{ value, setValue, orientation: props.orientation }}>
      <div
        className={`flex ${
          props.orientation === "vertical" ? "flex-row" : "border-l border-divide flex-col"
        } ${props.className ?? ""}`}
      >
        {props.children}
      </div>
    </TabContext.Provider>
  );
}

export function TabBody(props: { children: JSX.Element[] }): JSX.Element {
  const { value } = useContext(TabContext);

  return <div className="p-3 flex-grow">{props.children[value]}</div>;
}

export function TabBar(props: { children: JSX.Element[] }): JSX.Element {
  const { orientation } = useContext(TabContext);

  return (
    <div
      className={`p-3 ${
        orientation === "horizontal" ? "flex space-x-1" : "border-r border-divide space-y-1"
      }`}
    >
      {props.children}
    </div>
  );
}

export function TabBarItem(props: { children: ReactNode; value: number }): JSX.Element {
  const { value, setValue } = useContext(TabContext);

  return (
    <button
      className={`flex px-3 py-2 transition-colors duration-200 transform hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 rounded-md focus:outline-none ${
        props.value === value
          ? "text-blue-500 dark:text-indigo-400 bg-gray-200 dark:bg-gray-700"
          : "text-black dark:text-white"
      }`}
      onClick={() => setValue(props.value)}
    >
      {props.children}
    </button>
  );
}
