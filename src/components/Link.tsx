import { open } from "@tauri-apps/api/shell";

export default function Link(props: { to: string }) {
  return (
    <button
      onClick={() => open(props.to).then().catch}
      className="text-indigo-600 hover:text-indigo-700"
    >
      {props.to}
    </button>
  );
}
