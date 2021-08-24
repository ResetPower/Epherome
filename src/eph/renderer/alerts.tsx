import path from "path";
import { t } from "../intl";
import { moveToTrash } from "common/utils/files";
import { showOverlay } from "./overlays";
import { DefaultFn } from "common/utils";
import { AlertDialog, ConfirmDialog } from "../components/Dialog";

export function showMoveToTrashAlert(filepath: string): Promise<void> {
  return new Promise((resolve) => {
    const filename = path.basename(filepath);

    showOverlay(
      <ConfirmDialog
        title={t("moveToTrash")}
        message={t("confirmMoveSomethingToTrash", filename)}
        action={() => {
          moveToTrash(filepath).then(resolve);
        }}
      />
    );
  });
}

export function showJava16RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay(
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava16")}
      anyway={t("continueAnyway")}
      onAnyway={finallyRun}
    />
  );
}

export function showJava8RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay(
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava8")}
      anyway={t("continueAnyway")}
      onAnyway={finallyRun}
    />
  );
}

export function showNoJavaDialog(): void {
  showOverlay(
    <AlertDialog
      title={t("launching.javaNotFound")}
      message={t("launching.javaNotFoundMessage")}
    />
  );
}
