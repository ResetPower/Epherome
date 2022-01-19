import { EphExtensionTranslations } from "common/extension";
import { extensionStore } from "common/stores/extension";
import { Button } from "@resetpower/rcs";
import { intlStore } from "eph/intl";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { BiImport } from "react-icons/bi";
import { MdOpenInNew } from "react-icons/md";
import { VscExtensions } from "react-icons/vsc";
import { useCallback, useMemo } from "react";
import { ipcRenderer } from "electron";
import { showOverlay } from "eph/overlay";
import { userDataPath } from "common/utils/info";
import { openInFinder } from "common/utils/open";

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

export default function ExtensionView(): JSX.Element {
  const ephExtPath = useMemo(() => path.join(userDataPath, "ext"), []);
  const extensions = extensionStore.extensions;

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
          showOverlay({
            title: "Congrats🎉",
            message: `Extension ${name} successfully imported. Reload Epherome to load this extension?`,
            action: () => {
              location.reload();
            },
          });
        } else {
          showOverlay({
            title: "Warning",
            message:
              "You've chosen a wrong directory.\nA correct extension directory should contains a `main.js` and an `ext.json`",
          });
        }
      }),
    [ephExtPath]
  );

  return (
    <div>
      <div className="flex px-3">
        <Button onClick={() => openInFinder(ephExtPath)}>
          <MdOpenInNew />
          Open
        </Button>
        <Button onClick={handleImport}>
          <BiImport /> Import
        </Button>
      </div>
      <div className="grid grid-cols-5 px-9 py-3">
        {extensions.map((ext) => {
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
  );
}
