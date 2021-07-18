import { AlertDialog } from "../components/Dialog";
import GlobalOverlay from "../components/GlobalOverlay";
import { t } from "../renderer/global";

export function showJava16RequiredDialog(): void {
  GlobalOverlay.showDialog((close) => (
    <AlertDialog title={t.warning} message="Please consider using Java 16" close={close} />
  ));
}
