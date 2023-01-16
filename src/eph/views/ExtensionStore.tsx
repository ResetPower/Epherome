import { Button, Center, IconButton, ListItem, Spinner } from "@resetpower/rcs";
import { EphExtension } from "common/extension";
import { userDataPath } from "common/utils/info";
import { t } from "eph/intl";
import path from "path";
import { useMemo, useState } from "react";
import { MdExpandLess, MdExpandMore, MdFolder } from "react-icons/md";
import { VscExtensions } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";
import fs from "fs";
import { showOverlay } from "eph/overlay";
import { copyFolder, rmFolder } from "common/utils/files";
import { extensionStore } from "common/stores/extension";
import { BiImport } from "react-icons/bi";
import { openInFinder } from "common/utils/open";
import { nanoid } from "nanoid";
import { ipcRenderer } from "electron";
import { parseExtension } from "eph/loader";

function Panel(props: {
  label: string;
  controller: [EphExtension | null, (i: EphExtension) => unknown];
  list: EphExtension[] | null;
  open?: boolean;
  forceOpen?: boolean;
}): JSX.Element {
  const [current, setCurrent] = props.controller;
  const [expanded, setExpanded] = useState(props.open ?? false);

  return (
    <div>
      {!props.forceOpen && (
        <div
          className="flex bg-slate-500 bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20 cursor-pointer select-none transition-colors text-sm font-medium px-1 "
          onClick={() => setExpanded(!expanded)}
        >
          <p>{props.label}</p>
          <div className="flex-grow" />
          {props.list && props.list.length}
          {expanded ? <MdExpandLess /> : <MdExpandMore />}
        </div>
      )}
      {(props.forceOpen || expanded) &&
        (props.list ? (
          props.list.length === 0 ? (
            <p className="text-shallow text-center">No Items</p>
          ) : (
            props.list.map((e) => (
              <ListItem
                active={current ? current.id === e.id : false}
                className="p-3"
                onClick={() => setCurrent(e)}
                key={e.id}
                dependent
              >
                <VscExtensions className="w-7 mr-3" /> {e.manifest.name}
              </ListItem>
            ))
          )
        ) : (
          <Spinner />
        ))}
    </div>
  );
}

export default function ExtensionStore(): JSX.Element {
  const ephExtPath = useMemo(() => path.join(userDataPath, "ext"), []);
  const installed = [...extensionStore.extensions, ...extensionStore.imported];

  const controller = useState<EphExtension | null>(installed[0] ?? null);
  const current = controller[0];
  const [pending, setPending] = useState(false);

  const extStat = current && extensionStore.stat(current.id);

  const handleImport = () => {
    ipcRenderer.invoke("open-directory").then((dir) => {
      if (!dir) return;
      if (!fs.existsSync(path.join(dir, "manifest.json"))) {
        showOverlay({
          title: "Warning",
          message:
            "You've chosen a wrong directory.\nA correct extension directory should contains a `manifest.json`",
        });
        return;
      }
      const nid = nanoid();
      const target = path.join(userDataPath, "ext", nid);
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
      }
      copyFolder(dir, target);
      const ext = parseExtension(nid);
      if (ext) {
        extensionStore.import(ext);
        controller[1](ext);
      }
    });
  };

  const handleUninstall = () => {
    if (current) {
      setPending(true);
      const pos = path.join(userDataPath, "ext", current.id);
      rmFolder(pos).then(() => setPending(false));
    }
  };

  const handleReload = () => location.reload();

  return (
    <div className="eph-h-full flex">
      <div className="w-1/4 bg-card shadow-md py-1 flex flex-col">
        <div className="overflow-y-auto flex-grow">
          <Panel
            label={t("ext.installed")}
            list={installed}
            controller={controller}
            open
          />
        </div>
        <div className="flex justify-center space-x-3 border-t border-divider">
          <IconButton onClick={handleImport}>
            <BiImport />
          </IconButton>
          <IconButton onClick={() => openInFinder(ephExtPath)}>
            <MdFolder />
          </IconButton>
        </div>
      </div>
      <div className="w-3/4 overflow-y-auto">
        {current ? (
          <div>
            <div className="flex items-center px-6 py-3 border-b border-divider top-0 sticky bg-background space-x-3">
              <VscExtensions size="2em" />
              <div className="flex-grow">
                <p className="font-medium text-lg">{current.manifest.name}</p>
                <p className="text-shallow text-xs">ID: {current.id}</p>
              </div>
              {pending && <Spinner />}
              {extStat === "installed" && (
                <Button
                  className="bg-red-400 hover:bg-red-500 active:bg-red-600"
                  onClick={handleUninstall}
                  variant="pill"
                  disabled={pending}
                >
                  {t("ext.remove")}
                </Button>
              )}
              {extStat === "reloadRequiredToIn" && (
                <>
                  <p className="text-shallow text-sm">{t("ext.added")}</p>
                  <Button
                    className="bg-green-400 hover:bg-green-500 active:bg-green-600"
                    onClick={handleReload}
                    variant="pill"
                    disabled={pending}
                  >
                    {t("ext.reloadRequired")}
                  </Button>
                </>
              )}
              {extStat === "reloadRequiredToUn" && (
                <>
                  <p className="text-shallow text-sm">{t("ext.removed")}</p>
                  <Button
                    className="bg-green-400 hover:bg-green-500 active:bg-green-600"
                    onClick={handleReload}
                    variant="pill"
                    disabled={pending}
                  >
                    {t("ext.reloadRequired")}
                  </Button>
                </>
              )}
            </div>
            <ReactMarkdown className="p-3">
              {current.readme ?? "No Introduction"}
            </ReactMarkdown>
          </div>
        ) : (
          <Center className="text-shallow">{t("notSelected")}</Center>
        )}
      </div>
    </div>
  );
}
