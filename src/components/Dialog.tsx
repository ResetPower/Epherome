import { ReactNode } from "react";
import { t } from "../renderer/global";
import { DefaultFunction } from "../tools/types";
import Button from "./Button";
import Typography from "./Typography";

export default function Dialog(props: {
  children: ReactNode;
  indentBottom?: boolean;
}): JSX.Element {
  return (
    <div
      className={`p-6 w-full shadow-xl rounded-lg bg-card animate__animated animate__zoomIn eph-dialog ${
        props.indentBottom ? "pb-4" : ""
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
      {props.pre ? <pre>{props.message}</pre> : <Typography>{props.message}</Typography>}
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
