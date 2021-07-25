import { AlertDialog } from "../components/Dialog";
import { showDialog } from "../components/GlobalOverlay";
import { t } from "../renderer/global";

export function showJava16RequiredDialog(): void {
  showDialog((close) => (
    <AlertDialog title={t.warning} message={t.considerUsingJava16} close={close} />
  ));
}
