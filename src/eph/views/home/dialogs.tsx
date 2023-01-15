import { DefaultFn } from "common/utils";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { historyStore } from "eph/renderer/history";

export function showJava16RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava16"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    action: finallyRun,
  });
}

export function showJava17RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava17"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    fineCancel: true,
    action: finallyRun,
    bottomDivide: true,
    neutral: {
      text: t("java.installJava"),
      action: () => historyStore.push("java.installJava"),
    },
  });
}

export function showJava8RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava8"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    fineCancel: true,
    action: finallyRun,
    bottomDivide: true,
    neutral: {
      text: t("java.installJava"),
      action: () => historyStore.push("java.installJava"),
    },
  });
}

export function showNoJavaDialog(): void {
  showOverlay({
    title: t("launching.javaNotFound"),
    message: t("launching.javaNotFoundMessage"),
    cancellable: true,
    fineCancel: true,
    positiveText: t("java.installJava"),
    action: () => historyStore.push("java.installJava"),
    bottomDivide: true,
  });
}
