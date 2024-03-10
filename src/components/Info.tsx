import { ReactNode, useRef, useState } from "react";
import { concat } from "../utils";
import { IoMdCopy } from "react-icons/io";
import { clipboard, invoke } from "@tauri-apps/api";
import { toastStore } from "../stores/toast";
import { t } from "../intl";
import { MdCheck, MdEdit, MdOpenInNew } from "react-icons/md";
import TinyInput from "./TinyInput";

function TinyButton(props: { children: ReactNode }) {
  return (
    <div className="text-xs ml-1 cursor-pointer text-blue-500 hover:text-blue-700">
      {props.children}
    </div>
  );
}

export default function Info(props: {
  name: string;
  children: ReactNode;
  code?: boolean;
  editable?: (newValue: string) => unknown;
  openable?: string;
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
        {props.editable && (
          <TinyButton>
            {editing ? (
              <MdCheck onClick={onSubmit} />
            ) : (
              <MdEdit onClick={() => setEditing(true)} />
            )}
          </TinyButton>
        )}
        {props.copyable && (
          <TinyButton>
            <IoMdCopy
              onClick={() =>
                props.copyable &&
                clipboard
                  .writeText(props.copyable)
                  .then(() => toastStore.success(t.toast.copied)).catch
              }
            />
          </TinyButton>
        )}
        {props.openable && (
          <TinyButton>
            <MdOpenInNew
              onClick={() =>
                props.openable &&
                invoke("reveal_path", { pathname: props.openable }).then().catch
              }
            />
          </TinyButton>
        )}
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
