import { MouseEventHandler } from "react";
import { concat } from "../utils";
import { clipboard } from "@tauri-apps/api";
import { t } from "../intl";
import { toastStore } from "../stores/toast";
import Button from "./Button";

export type DialogType = "default" | "whether" | "errorlog" | "noneready" | undefined;

function Default(props :{
    dialogTitle?: string;
    dialogContent?: string;
    onClickOk?: MouseEventHandler;
    onClickCancel?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-75 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <div className="m-5">
                {props.dialogContent}
            </div>
            <div className="flex justify-end space-x-5">
                <Button onClick={props.onClickCancel}>{t.dialog.cancel}</Button>
                <Button primary onClick={props.onClickOk}>{t.dialog.ok}</Button>
            </div>
        </div>
    )
}

function Whether(props :{
    dialogTitle?: string;
    dialogContent?: string;
    onClickYes?: MouseEventHandler;
    onClickNo?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-75 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200"
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

function ErrorLog(props :{
    dialogTitle?: string;
    dialogContent?: string;
    onClickOk?: MouseEventHandler;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-75 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200"
            )}
            >{props.dialogTitle}</h1>
            <hr></hr>
            <div className="m-5">
                {props.dialogContent}
            </div>
            <div className="flex justify-end space-x-5">
                <Button dangerous onClick={() =>
                    props.dialogContent &&
                    clipboard
                        .writeText(props.dialogContent)
                        .then(() => toastStore.success(t.toast.copied)).catch
                }>{t.dialog.copylog}</Button>
                <Button primary onClick={props.onClickOk}>{t.dialog.ok}</Button>
            </div>
        </div>
    )
}

function NoneReady(props: {
    dialogTitle?: string;
    dialogContent?: string;
}) {
    return (
        <div className={concat(
            "table bg-stone-150 dark:bg-stone-900 rounded-md bg-opacity-75 p-5 shadow-xl max-w-[80%] max-h-300 overflow-auto"
        )}>
            <h1 className={concat(
                "text-center font-bold text-gray-800 dark:text-gray-200"
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
    children?: string;
}) {
    return (
        <div
            className={concat(
                props.className,
                "fixed w-full h-full flex justify-center items-center bg-stone-100 bg-opacity-70 dark:bg-stone-900 dark:bg-opacity-70"
            )}
        >
            {props.type === "default" && <Default onClickOk={props.onClickOk} onClickCancel={props.onClickCancel} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === undefined && <Default onClickOk={props.onClickOk} onClickCancel={props.onClickCancel} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "whether" && <Whether onClickYes={props.onClickYes} onClickNo={props.onClickNo} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "errorlog" && <ErrorLog onClickOk={props.onClickOk} dialogTitle={props.title} dialogContent={props.children}/>}
            {props.type === "noneready" && <NoneReady dialogTitle={props.title} dialogContent={props.children}/>}
        </div>
    )
}