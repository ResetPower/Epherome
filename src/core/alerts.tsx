import { AlertDialog } from "../components/Dialog";
import GlobalOverlay from "../components/GlobalOverlay";
import { t } from "../renderer/global";

export function showJava16RequiredDialog(): void {
  GlobalOverlay.showDialog((close) => (
    <AlertDialog title={t.warning} message={t.considerUsingJava16} close={close} />
  ));
}
