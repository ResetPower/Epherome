import { toastStore } from "../stores/toast";
import { useForceUpdate } from "../utils";
import Toast from "./Toast";

export default function ToastWrapper() {
  const forceUpdate = useForceUpdate();
  toastStore.subscribe(forceUpdate);

  const toast = toastStore.state;

  return (
    toast && (
      <Toast type={toast.type} out={toast.out}>
        {toast.message}
      </Toast>
    )
  );
}
