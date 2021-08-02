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
    <TabContext.Provider
      value={{ value, setValue, orientation: props.orientation }}
    >
      <div
        className={`flex ${
          props.orientation === "vertical" ? "flex-row" : "flex-col"
        } ${props.className ?? ""}`}
      >
        {props.children}
      </div>
    </TabContext.Provider>
  );
}

export function TabBody(props: { children: JSX.Element[] }): JSX.Element {
  const { value } = useContext(TabContext);

  return <div className="eph-tab-body">{props.children[value]}</div>;
}

export function TabBar(props: { children: JSX.Element[] }): JSX.Element {
  const { orientation } = useContext(TabContext);

  return (
    <div
      className={`eph-tab-bar ${
        orientation === "horizontal"
          ? "eph-tab-bar-horizontal"
          : "eph-tab-bar-vertical"
      }`}
    >
      {props.children}
    </div>
  );
}

export function TabBarItem(props: {
  children: ReactNode;
  value: number;
}): JSX.Element {
  const { value, setValue } = useContext(TabContext);

  return (
    <button
      className={`eph-tab-bar-item ${
        props.value === value ? "eph-tab-bar-item-selected" : "text-contrast"
      }`}
      onClick={() => setValue(props.value)}
    >
      {props.children}
    </button>
  );
}
