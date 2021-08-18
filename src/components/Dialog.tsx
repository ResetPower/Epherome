import { ReactNode } from "react";
import { t } from "../intl";
import { useOverlayCloser } from "../renderer/overlays";
import { call, DefaultFn } from "../tools";
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
}): JSX.Element {
  const close = useOverlayCloser();

  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{props.title}</p>
      {typeof props.message === "string"
        ? props.message
            .split("\n")
            .map((val, index) => <p key={index}>{val}</p>)
        : props.message}
      <div className="flex">
        {props.anyway && (
          <Button
            onClick={() => {
              call(props.onAnyway);
              close();
            }}
          >
            {props.anyway}
          </Button>
        )}
        <div className="flex-grow" />
        <Button className="text-secondary" onClick={close}>
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
  positiveClassName?: string;
  positiveText?: string;
}): JSX.Element {
  const close = useOverlayCloser();

  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{props.title}</p>
      <p>{props.message}</p>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={close}>
          {t("cancel")}
        </Button>
        <Button
          className={props.positiveClassName ?? "text-secondary"}
          onClick={() => {
            props.action();
            close();
          }}
        >
          {props.positiveText ?? t("fine")}
        </Button>
      </div>
    </Dialog>
  );
}

export function ExportedDialog(props: { target: string }): JSX.Element {
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
    />
  );
}

export function ErrorDialog(props: { stacktrace: string }): JSX.Element {
  return <AlertDialog title={t("errorOccurred")} message={props.stacktrace} />;
}

export function InternetNotAvailableDialog(): JSX.Element {
  return <AlertDialog title={t("tip")} message={t("internetNotAvailable")} />;
}

export function NotSupportedDialog(): JSX.Element {
  return <AlertDialog title={t("tip")} message={t("notSupportedYet")} />;
}
