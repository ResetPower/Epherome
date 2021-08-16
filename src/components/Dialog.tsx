import { ReactNode } from "react";
import { t } from "../intl";
import { showOverlay } from "../renderer/overlays";
import { DefaultFn, unwrapFunction } from "../tools";
import { Button, Link } from "./inputs";

export default function Dialog(props: {
  children: ReactNode;
  className?: string;
  indentBottom?: boolean;
}): JSX.Element {
  return (
    <div
      className={`eph-dialog ${
        props.indentBottom ? "eph-dialog-indent-bottom" : ""
      } ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
}

export function AlertDialog(props: {
  title: string;
  message: ReactNode;
  anyway?: string;
  onAnyway?: DefaultFn;
  close: DefaultFn;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{props.title}</p>
      {typeof props.message === "string"
        ? props.message.split("\n").map((val) => <p>{val}</p>)
        : props.message}
      <div className="flex">
        {props.anyway && (
          <Button
            onClick={() => {
              unwrapFunction(props.onAnyway)();
              props.close();
            }}
          >
            {props.anyway}
          </Button>
        )}
        <div className="flex-grow" />
        <Button className="text-secondary" onClick={props.close}>
          {t("fine")}
        </Button>
      </div>
    </Dialog>
  );
}

export function ConfirmDialog(props: {
  title: string;
  message: ReactNode;
  action: DefaultFn;
  close: DefaultFn;
  positiveClassName?: string;
  positiveText?: string;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{props.title}</p>
      <p>{props.message}</p>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.close}>
          {t("cancel")}
        </Button>
        <Button
          className={props.positiveClassName ?? "text-secondary"}
          onClick={() => {
            props.action();
            props.close();
          }}
        >
          {props.positiveText ?? t("fine")}
        </Button>
      </div>
    </Dialog>
  );
}

export function ExportedDialog(props: {
  target: string;
  close: DefaultFn;
}): JSX.Element {
  return (
    <AlertDialog
      title={t("tip")}
      message={
        <>
          {t("exportedAt")}
          <br />
          <Link href={props.target} type="file">
            {props.target}
          </Link>
        </>
      }
      close={props.close}
    />
  );
}

export function ErrorDialog(props: {
  stacktrace: string;
  close: DefaultFn;
}): JSX.Element {
  return (
    <AlertDialog
      title={t("errorOccurred")}
      message={props.stacktrace}
      close={props.close}
    />
  );
}

export const showInternetNotAvailableDialog = (): void => {
  showOverlay((close) => (
    <AlertDialog
      title={t("tip")}
      message={t("internetNotAvailable")}
      close={close}
    />
  ));
};

export const showNotSupportedDialog = (): void => {
  showOverlay((close) => (
    <AlertDialog
      title={t("tip")}
      message={t("notSupportedYet")}
      close={close}
    />
  ));
};
