import { AlertDialog } from "../components/Dialog";
import { showOverlay } from "../renderer/overlays";
import { t } from "../intl";
import { DefaultFn } from "../tools";

export function showJava16RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay((close) => (
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava16")}
      anyway={t("continueAnyway")}
      onAnyway={finallyRun}
      close={close}
    />
  ));
}

export function showJava8RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay((close) => (
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava8")}
      anyway={t("continueAnyway")}
      onAnyway={finallyRun}
      close={close}
    />
  ));
}

export function showNoJavaDialog(): void {
  showOverlay((close) => (
    <AlertDialog
      title={t("launching.javaNotFound")}
      message={t("launching.javaNotFoundMessage")}
      close={close}
    />
  ));
}
