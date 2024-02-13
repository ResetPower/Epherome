import { open } from "@tauri-apps/api/shell";
import { ReactNode } from "react";

export default function Link(props: { to: string; children?: ReactNode }) {
  return (
    <button
      onClick={() => open(props.to).then().catch}
      className="text-indigo-500 hover:text-indigo-800 transition-colors hover:underline"
    >
      {props.children ?? props.to}
    </button>
  );
}
