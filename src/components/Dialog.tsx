import { ReactNode } from "react";
import { t } from "../renderer/global";
import { DefaultFunction } from "../tools/types";
import { Button } from "./inputs";
import { Typography } from "./layouts";

export default function Dialog(props: {
  children: ReactNode;
  className?: string;
  indentBottom?: boolean;
}): JSX.Element {
  return (
    <div
      className={`shadow-xl rounded-xl bg-card eph-dialog p-6 ${props.indentBottom ? "pb-4" : ""} ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
}

export function AlertDialog(props: {
  title: string;
  message: string;
  pre?: boolean;
  close: DefaultFunction;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">{props.title}</Typography>
      {props.pre ? (
        <pre className="text-black dark:text-white whitespace-pre-line">{props.message}</pre>
      ) : (
        <Typography>{props.message}</Typography>
      )}
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={props.close} textInherit>
          {t.ok}
        </Button>
      </div>
    </Dialog>
  );
}

export function ConfirmDialog(props: {
  title: string;
  message: string;
  action: DefaultFunction;
  close: DefaultFunction;
  positiveClassName?: string;
  positiveText?: string;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">{props.title}</Typography>
      <Typography>{props.message}</Typography>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.close} textInherit>
          {t.cancel}
        </Button>
        <Button
          className={props.positiveClassName ?? "text-secondary"}
          onClick={() => {
            props.action();
            props.close();
          }}
          textInherit
        >
          {props.positiveText ?? t.ok}
        </Button>
      </div>
    </Dialog>
  );
}
