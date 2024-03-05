import { Fragment } from "react";
import { DialogState, dialogStore } from "../stores/dialog";
import { concat } from "../utils";
import Button from "./Button";

export default function Dialog(props: DialogState) {
  return (
    <div
      className={concat(
        "border bg-white dark:bg-gray-800 rounded-lg p-3 w-1/2",
        props.out
          ? "animate-out zoom-out duration-300"
          : "animate-in zoom-in duration-300"
      )}
    >
      <div className="font-medium text-center mb-3 border-b">{props.title}</div>
      <div className="my-3">{props.message}</div>
      <div className="flex items-center space-x-3 justify-end">
        {props.action ? (
          <Fragment>
            <Button onClick={() => dialogStore.clear()}>Cancel</Button>
            <Button
              onClick={() => {
                props.action && props.action();
                dialogStore.clear();
              }}
              primary={!props.dangerous}
              dangerous={props.dangerous}
            >
              {props.actionName ?? "Fine"}
            </Button>
          </Fragment>
        ) : (
          <Button primary onClick={() => dialogStore.clear()}>
            Fine
          </Button>
        )}
      </div>
    </div>
  );
}
