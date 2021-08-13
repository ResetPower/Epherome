import path from "path";
import { t } from "../intl";
import { moveToTrash } from "../models/files";
import { showOverlay } from "../renderer/overlays";
import { DefaultFn } from "../tools";
import { ConfirmDialog } from "./Dialog";

export function showMoveToTrashAlert(
  filepath: string,
  updater: DefaultFn
): void {
  const filename = path.basename(filepath);
  showOverlay((close) => (
    <ConfirmDialog
      title={t("moveToTrash")}
      message={t("confirmMoveSomethingToTrash", filename)}
      action={() => {
        moveToTrash(filepath);
        updater();
      }}
      close={close}
    />
  ));
}
