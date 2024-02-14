import { ReactNode, useRef, useState } from "react";
import { concat } from "../utils";
import { IoMdCopy } from "react-icons/io";
import { clipboard } from "@tauri-apps/api";
import { toastStore } from "../stores/toast";
import { t } from "../intl";
import { MdCheck, MdEdit } from "react-icons/md";
import TinyInput from "./TinyInput";

export default function Info(props: {
  name: string;
  children: ReactNode;
  code?: boolean;
  editable?: (newValue: string) => unknown;
  copyable?: string;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const onSubmit = () => {
    setEditing(false);
    if (props.editable && ref.current) {
      props.editable(ref.current.value);
    }
  };

  return (
    <div className="p-1">
      <div className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center">
        <div>{props.name}</div>
        <div className="text-xs mx-1 cursor-pointer text-blue-500 hover:text-blue-600">
          {props.editable &&
            (editing ? (
              <MdCheck onClick={onSubmit} />
            ) : (
              <MdEdit onClick={() => setEditing(true)} />
            ))}
          {props.copyable && (
            <IoMdCopy
              onClick={() =>
                props.copyable &&
                clipboard
                  .writeText(props.copyable)
                  .then(() => toastStore.success(t.toast.copied)).catch
              }
            />
          )}
        </div>
      </div>
      {typeof props.children === "string" ? (
        editing ? (
          <TinyInput
            ref={ref}
            initialValue={props.children}
            onSubmit={onSubmit}
            autoFocus
          />
        ) : (
          <div className={concat(props.code && "font-mono text-sm")}>
            {props.children}
          </div>
        )
      ) : (
        props.children
      )}
    </div>
  );
}
