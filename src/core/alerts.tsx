import { AlertDialog } from "../components/Dialog";
import { showDialog } from "../renderer/overlays";
import { t } from "../intl";

export function showJava16RequiredDialog(): void {
  showDialog((close) => (
    <AlertDialog
      title={t("warning")}
      message={t("launching.considerUsingJava16")}
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
