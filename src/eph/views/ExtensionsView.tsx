import { intlStore, t } from "../intl";
import { showOverlay, useOverlayCloser } from "../renderer/overlays";
import { BottomSheet, BottomSheetTitle } from "../components/sheets";
import {
  EphExtensionTranslations,
  extensionStore,
} from "common/stores/extension";
import { VscExtensions } from "react-icons/vsc";
import { configStore } from "common/struct/config";
import { Button } from "eph/components/inputs";
import { MdDeveloperBoard, MdFolderOpen } from "react-icons/md";
import { BiImport } from "react-icons/bi";
import { ipcRenderer } from "electron";
import path from "path";
import fs from "fs";
import { AlertDialog, ConfirmDialog } from "eph/components/Dialog";
import { ephExtPath } from "common/struct/config";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { openPathInFinder } from "common/utils/open";

function Square(props: { children: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center space-y-1 select-none">
      <div className="shadow-sm bg-background rounded-lg h-12 w-12 cursor-pointer flex items-center justify-center">
        <VscExtensions />
      </div>
      <p className="whitespace-pre-wrap text-sm text-center leading-3 pt-1">
        {props.children}
      </p>
    </div>
  );
}

export default function ExtensionsView(): JSX.Element {
  const dev = configStore.developerMode;
  const exts = extensionStore.extensions;
  const close = useOverlayCloser();

  const handleImport = useCallback(
    () =>
      ipcRenderer.invoke("open-directory").then((dir) => {
        if (!dir) return;
        const name = path.basename(dir);
        const sourceFiles = {
          meta: path.join(dir, "ext.json"),
          runnable: path.join(dir, "main.js"),
        };
        const target = path.join(ephExtPath, nanoid());
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target);
        }
        const targetFiles = {
          meta: path.join(target, "ext.json"),
          runnable: path.join(target, "main.js"),
        };
        if (
          fs.existsSync(sourceFiles.meta) &&
          fs.existsSync(sourceFiles.runnable)
        ) {
          fs.copyFileSync(sourceFiles.meta, targetFiles.meta);
          fs.copyFileSync(sourceFiles.runnable, targetFiles.runnable);
          showOverlay(
            <ConfirmDialog
              title="Congrats🎉"
              message={`Extension ${name} successfully imported. Reload Epherome to load this extension?`}
              action={() => {
                location.reload();
              }}
            />
          );
        } else {
          showOverlay(
            <AlertDialog
              title="Warning"
              message={
                "You've chosen a wrong directory.\nA correct extension directory should contains a `main.js` and an `ext.json`"
              }
            />
          );
        }
      }),
    []
  );

  return (
    <BottomSheet>
      <div
        className="w-11/12 bg-card rounded-t-xl overflow-y-auto"
        style={{ height: "calc(100vh * 0.833333)" }}
      >
        <BottomSheetTitle close={close}>{t("extensions")}</BottomSheetTitle>
        {dev && (
          <div className="flex items-center p-1 mx-9 border-b border-opacity-5 border-black">
            <MdDeveloperBoard />
            <div className="flex-grow" />
            <Button
              onClick={() => openPathInFinder(ephExtPath)}
              variant="contained"
            >
              <MdFolderOpen /> Open
            </Button>
            <Button onClick={handleImport} variant="contained">
              <BiImport /> Import
            </Button>
          </div>
        )}
        <div className="grid grid-cols-5 px-9 py-3">
          {exts.length === 0 && <p>{t("profile.noContent")}</p>}
          {exts.map((ext) => {
            const translations = ext.meta.translations;
            return (
              <Square key={ext.id}>
                {translations[
                  intlStore.language?.name as EphExtensionTranslations
                ] ?? translations.default}
              </Square>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
