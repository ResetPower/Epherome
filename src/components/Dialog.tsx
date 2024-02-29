import { ReactNode, MouseEventHandler } from "react";
import { concat } from "../utils";
import { clipboard } from "@tauri-apps/api";
import { t } from "../intl";
import { toastStore } from "../stores/toast";
import Button from "./Button";

export type DialogType = "default" | "whether" | "errorlog" | "noneready" | undefined;

function DefaultDialog(props :{
    dialogTitle?: string;
    dialogContent?: ReactNode;
    onClickOk?: MouseEventHandler;
    onClickCancel?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-95 dark:bg-opacity-95 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200  cursor-default"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <div className="m-5">
                {props.dialogContent}
            </div>
            <div className="flex justify-end space-x-5">
                <Button primary onClick={props.onClickOk}>{t.dialog.ok}</Button>
            </div>
        </div>
    )
}

function WhetherDialog(props :{
    dialogTitle?: string;
    dialogContent?: ReactNode;
    onClickYes?: MouseEventHandler;
    onClickNo?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-95 dark:bg-opacity-95 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200  cursor-default"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <div className="m-5">
                {props.dialogContent}
            </div>
            <div className="flex justify-center space-x-5">
                <Button dangerous onClick={props.onClickNo}>{t.dialog.no}</Button>
                <Button primary onClick={props.onClickYes}>{t.dialog.yes}</Button>
            </div>
        </div>
    )
}

function ErrorLogDialog(props :{
    dialogTitle?: string;
    dialogContent?: ReactNode;
    onClickOk?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-95 dark:bg-opacity-95 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200  cursor-default"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <textarea className={concat(
                "m-3 p-3 resize-none bg-neutral-50 dark:bg-neutral-950 cursor-auto"
            )} rows={12} cols={50} spellCheck={false} disabled value={props.dialogContent as string} />
            <div className="flex justify-end space-x-5">
                <Button dangerous className="" onClick={() =>
                    props.dialogContent &&
                    clipboard
                        .writeText(props.dialogContent as string)
                        .then(() => toastStore.success(t.toast.copied)).catch
                }>{t.dialog.copyLog}</Button>
                <Button primary className="" onClick={props.onClickOk}>{t.dialog.ok}</Button>
            </div>
        </div>
    )
}

function NoneReadyDialog(props: {
    dialogTitle?: string;
    dialogContent?: ReactNode;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-95 p-5 dark:bg-opacity-95 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200  cursor-default"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <div className="m-5">
                {props.dialogContent}
            </div>
        </div>
    )
}

export default function Dialog(props :{
    className?: string;
    type?: DialogType;
    title?: string;
    onClickOk?: MouseEventHandler;
    onClickCancel?: MouseEventHandler;
    onClickYes?: MouseEventHandler;
    onClickNo?: MouseEventHandler;
    children?: ReactNode;
}) {
    return (
        <div
            className={concat(
                "fixed w-full h-full flex justify-center items-center bg-stone-100 bg-opacity-90 dark:bg-stone-900 dark:bg-opacity-80 select-none"
            )}
        >
            {props.type === "default" && <DefaultDialog onClickOk={props.onClickOk} onClickCancel={props.onClickCancel} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === undefined && <DefaultDialog onClickOk={props.onClickOk} onClickCancel={props.onClickCancel} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "whether" && <WhetherDialog onClickYes={props.onClickYes} onClickNo={props.onClickNo} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "errorlog" && <ErrorLogDialog onClickOk={props.onClickOk} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "noneready" && <NoneReadyDialog dialogTitle={props.title} dialogContent={props.children}/>}
        </div>
    )
}