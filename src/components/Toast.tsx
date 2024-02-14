import { MdCheckCircle } from "react-icons/md";
import { ToastState } from "../stores/toast";
import { concat } from "../utils";
import { IoMdCloseCircle } from "react-icons/io";

export default function Toast(props: ToastState) {
  return (
    <div
      className={concat(
        "z-50 absolute bottom-5 left-5",
        "flex items-center space-x-3 rounded-lg shadow-lg px-5 py-3",
        "bg-opacity-70 bg-slate-800 text-white dark:bg-slate-200 dark:text-black",
        props.out
          ? "animate-out slide-out-to-left fade-out duration-300"
          : "animate-in slide-in-from-left fade-in duration-300"
      )}
    >
      {props.type === "fail" && <IoMdCloseCircle className="text-red-400" />}
      {props.type === "success" && <MdCheckCircle className="text-green-400" />}
      <div>
        <div className="text-sm font-medium">{props.message}</div>
        {props.description && (
          <div className="text-xs text-slate-200">{props.description}</div>
        )}
      </div>
    </div>
  );
}
