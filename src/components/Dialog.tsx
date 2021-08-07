import { ReactNode } from "react";
import { t } from "../intl";
import { DefaultFn, unwrapFunction } from "../tools";
import { Button } from "./inputs";
import { Typography } from "./layouts";

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
  message: string;
  anyway?: string;
  onAnyway?: DefaultFn;
  pre?: boolean;
  close: DefaultFn;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">{props.title}</Typography>
      {props.pre ? (
        <pre className="text-contrast whitespace-pre-line">{props.message}</pre>
      ) : (
        <Typography>{props.message}</Typography>
      )}
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
  message: string;
  action: DefaultFn;
  close: DefaultFn;
  positiveClassName?: string;
  positiveText?: string;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">{props.title}</Typography>
      <Typography>{props.message}</Typography>
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

export function ErrorDialog(props: {
  stacktrace: string;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <AlertDialog
      title={t("errorOccurred")}
      message={props.stacktrace}
      close={props.onClose}
      pre
    />
  );
}
