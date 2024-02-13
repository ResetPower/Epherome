import { MdCheckCircle } from "react-icons/md";
import { ToastType } from "../stores/toast";
import { concat } from "../utils";

export default function Toast(props: {
  type?: ToastType;
  out?: boolean;
  children: string;
}) {
  return (
    <div
      className={concat(
        "z-50 absolute bottom-5 left-5",
        "flex items-center space-x-3 rounded-lg shadow-lg px-5 py-3",
        "bg-opacity-70 bg-slate-800 text-white",
        props.out
          ? "animate-out slide-out-to-left fade-out duration-300"
          : "animate-in slide-in-from-left fade-in duration-300"
      )}
    >
      {props.type === "success" && <MdCheckCircle className="text-green-400" />}
      <div className="text-sm font-medium">{props.children}</div>
    </div>
  );
}
