import { concat, useForceUpdate } from "../utils";
import { dialogStore } from "../stores/dialog";
import Dialog from "./Dialog";

export default function DialogWrapper() {
  const forceUpdate = useForceUpdate();
  dialogStore.subscribe(forceUpdate);

  const dialog = dialogStore.state;

  return (
    dialog && (
      <div
        className={concat(
          "z-50 absolute backdrop-blur-sm bg-gray-300 dark:bg-gray-600 bg-opacity-50 dark:bg-opacity-50 h-full w-full grid place-items-center",
          dialog.out
            ? "animate-out fade-out duration-300"
            : "animate-in fade-in duration-300"
        )}
      >
        <Dialog {...dialog} />
      </div>
    )
  );
}
