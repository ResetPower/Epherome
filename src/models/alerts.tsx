import path from "path";
import { t } from "../intl";
import { moveToTrash } from "./files";
import { showOverlay } from "../renderer/overlays";
import { DefaultFn } from "../tools";
import { ConfirmDialog } from "../components/Dialog";

export function showMoveToTrashAlert(
  filepath: string,
  updater: DefaultFn
): void {
  const filename = path.basename(filepath);

  showOverlay(
    <ConfirmDialog
      title={t("moveToTrash")}
      message={t("confirmMoveSomethingToTrash", filename)}
      action={() => {
        moveToTrash(filepath).then(updater);
      }}
    />
  );
}
