import { AlertDialog } from "../components/Dialog";
import { showDialog } from "../renderer/overlays";
import { t } from "../intl";
import { DefaultFn } from "../tools";

export function showJava16RequiredDialog(finallyRun: DefaultFn): void {
  showDialog((close) => (
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava16")}
      anyway={t("launching.continueAnyway")}
      onAnyway={finallyRun}
      close={close}
    />
  ));
}

export function showJava8RequiredDialog(finallyRun: DefaultFn): void {
  showDialog((close) => (
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava8")}
      anyway={t("launching.continueAnyway")}
      onAnyway={finallyRun}
      close={close}
    />
  ));
}

export function showNoJavaDialog(): void {
  showDialog((close) => (
    <AlertDialog
      title={t("launching.javaNotFound")}
      message={t("launching.javaNotFoundMessage")}
      close={close}
    />
  ));
}
