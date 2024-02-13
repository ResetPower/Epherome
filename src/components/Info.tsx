import { ReactNode } from "react";
import { concat } from "../utils";
import { IoMdCopy } from "react-icons/io";
import { clipboard } from "@tauri-apps/api";
import { toastStore } from "../stores/toast";
import { t } from "../intl";

export default function Info(props: {
  name: string;
  children: ReactNode;
  code?: boolean;
  copyable?: string;
  className?: string;
}) {
  return (
    <div className="p-1">
      <div className="text-gray-600 text-sm font-medium flex items-center">
        <span>{props.name}</span>
        {props.copyable && (
          <IoMdCopy
            className="text-xs mx-1 cursor-pointer hover:text-gray-700"
            onClick={() =>
              props.copyable &&
              clipboard
                .writeText(props.copyable)
                .then(() => toastStore.success(t.toast.copied)).catch
            }
          />
        )}
      </div>
      <div
        className={concat(props.className, props.code && "font-mono text-sm")}
      >
        {props.children}
      </div>
    </div>
  );
}
