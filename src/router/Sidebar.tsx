import { MouseEventHandler, ReactNode, useState } from "react";
import { concat } from "../utils";
import { historyStore } from ".";
import { RouteName } from "./map";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { t } from "../intl";
import { cfg } from "../stores/config";

export interface SidebarItem {
  path: RouteName;
  icon: ReactNode;
  name: string;
}

function SidebarButton(props: {
  onClick?: MouseEventHandler;
  active?: boolean;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      onClick={props.onClick}
      className={concat(
        "flex space-x-1 items-center p-3 transition-colors font-medium",
        "hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600",
        props.active && "bg-gray-100 dark:bg-gray-700"
      )}
    >
      <div className="text-xl">{props.icon}</div>
      {props.children && <div className="text-sm">{props.children}</div>}
    </button>
  );
}

export default function Sidebar(props: { items: SidebarItem[] }) {
  const [expanded, setExpanded] = useState(!cfg.autoCollapse);

  return (
    <div className="shadow flex flex-col whitespace-nowrap">
      {props.items.map((item, index) => (
        <SidebarButton
          onClick={() => historyStore.go(item.path)}
          active={historyStore.location === item.path}
          key={index}
          icon={item.icon}
        >
          {expanded && item.name}
        </SidebarButton>
      ))}
      <div className="flex-grow" />
      <SidebarButton
        icon={expanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
        onClick={() => setExpanded((x) => !x)}
      >
        {expanded && t.sidebar.collapse}
      </SidebarButton>
    </div>
  );
}
