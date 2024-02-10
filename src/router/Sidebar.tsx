import { ReactNode } from "react";
import { concat } from "../utils";
import { historyStore } from ".";
import { RouteName } from "./map";

export interface SidebarItem {
  path: RouteName;
  icon: ReactNode;
  name: string;
}

export default function Sidebar(props: { items: SidebarItem[] }) {
  return (
    <div className="p-2 m-1 rounded border shadow flex flex-col space-y-1 whitespace-nowrap">
      {props.items.map((item, index) => (
        <button
          onClick={() => historyStore.go(item.path)}
          className={concat(
            "flex space-x-1 items-center rounded p-1 transition-colors hover:bg-gray-100 active:bg-gray-200",
            historyStore.location === item.path && "bg-gray-100"
          )}
          key={index}
        >
          {item.icon}
          <p className="text-sm font-medium">{item.name}</p>
        </button>
      ))}
    </div>
  );
}
