import { DefaultFn } from "common/utils";
import { ReactNode } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

export default function ExpansionPanel(props: {
  label: string;
  children: ReactNode;
  length?: number;
  open?: boolean;
  forceOpen?: boolean;
  onToggle: DefaultFn;
}): JSX.Element {
  return (
    <div>
      {!props.forceOpen && (
        <div
          className="flex bg-slate-500 bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20 cursor-pointer select-none transition-colors text-sm font-medium px-1 "
          onClick={props.onToggle}
        >
          <p>{props.label}</p>
          <div className="flex-grow" />
          {props.length && props.length}
          {props.open ? <MdExpandLess /> : <MdExpandMore />}
        </div>
      )}
      {(props.forceOpen || props.open) && props.children}
    </div>
  );
}
