import {
  Button,
  Center,
  IconButton,
  Link,
  ListItem,
  Spin,
  TinyTextField,
} from "@resetpower/rcs";
import { EphExtensionMeta } from "common/extension";
import { userDataPath } from "common/utils/info";
import { t } from "eph/intl";
import got from "got";
import path from "path";
import { useEffect, useMemo, useState } from "react";
import {
  MdArrowBackIos,
  MdExpandLess,
  MdExpandMore,
  MdFolder,
} from "react-icons/md";
import { VscExtensions } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";
import fs from "fs";
import { showOverlay } from "eph/overlay";
import { ensureDir, rmFolder } from "common/utils/files";
import { extensionStore } from "common/stores/extension";
import { BiImport } from "react-icons/bi";
import { openInFinder } from "common/utils/open";
import { nanoid } from "nanoid";
import { ipcRenderer } from "electron";

interface ExtJSON {
  id: string;
  meta: EphExtensionMeta;
}

function handleImport() {
  ipcRenderer.invoke("open-directory").then((dir) => {
    if (!dir) return;
    const name = path.basename(dir);
    const sourceFiles = {
      meta: path.join(dir, "ext.json"),
      runnable: path.join(dir, "main.js"),
    };
    const target = path.join(userDataPath, "ext", nanoid());
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
  });
}

function Panel(props: {
  label: string;
  controller: [ExtJSON | null, (i: ExtJSON) => unknown];
  list: ExtJSON[] | null;
  open?: boolean;
  forceOpen?: boolean;
}): JSX.Element {
  const [current, setCurrent] = props.controller;
  const [expanded, setExpanded] = useState(props.open ?? false);

  return (
    <div>
      {!props.forceOpen && (
        <div
          className="flex bg-white bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20 cursor-pointer select-none transition-colors text-sm font-semibold px-1 "
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
                checked={current ? current.id === e.id : false}
                className="p-3"
                onClick={() => setCurrent(e)}
                key={e.id}
                dependent
              >
                <VscExtensions className="w-7 mr-3" /> {e.meta.name}
              </ListItem>
            ))
          )
        ) : (
          <Spin />
        ))}
    </div>
  );
}

export default function ExtensionStore(): JSX.Element {
  const [stat, setStat] = useState(false);
  const [result, setResult] = useState<ExtJSON[] | null>(null);
  const [recommended, setRecommended] = useState<ExtJSON[] | null>(null);
  const [all, setAll] = useState<ExtJSON[] | null>(null);
  const [query, setQuery] = useState("");
  const controller = useState<ExtJSON | null>(null);
  const current = controller[0];
  const [pending, setPending] = useState(false);

  const ephExtPath = useMemo(() => path.join(userDataPath, "ext"), []);
  const installed: ExtJSON[] = useMemo(
    () => extensionStore.extensions.map((v) => ({ id: v.id, meta: v.meta })),
    []
  );

  const extStat = current && extensionStore.stat(current.id);

  const handleInstall = () => {
    if (current) {
      setPending(true);
      got
        .post("https://epherome.com/api/ext-download", {
          body: JSON.stringify({
            id: current.id,
          }),
        })
        .then((resp) => {
          const pos = path.join(userDataPath, "ext", current.id);
          ensureDir(pos);
          const parsed = Buffer.from(resp.body, "base64");
          const meta = path.join(pos, "ext.json");
          const exe = path.join(pos, "main.js");
          fs.writeFileSync(meta, JSON.stringify(current.meta));
          fs.writeFileSync(exe, parsed);
          setPending(false);
        })
        .catch((error) => {
          showOverlay({
            title: t("warning"),
            message: t("errorOccurred"),
          });
          setPending(false);
          throw error;
        });
    }
  };
  const handleUninstall = () => {
    if (current) {
      setPending(true);
      const pos = path.join(userDataPath, "ext", current.id);
      rmFolder(pos).then(() => setPending(false));
    }
  };
  const handleSearch = () => {
    if (query) {
      setResult(null);
      got
        .post("https://epherome.com/api/ext-search", {
          body: JSON.stringify({ query }),
        })
        .then((resp) => setResult(JSON.parse(resp.body)));
      setStat(true);
    }
  };
  const handleReload = () => location.reload();

  useEffect(() => {
    got("https://epherome.com/api/ext").then((resp) =>
      setAll(JSON.parse(resp.body))
    );
    got("https://epherome.com/api/ext-recommended").then((resp) =>
      setRecommended(JSON.parse(resp.body))
    );
  }, []);

  return (
    <div className="eph-h-full flex">
      <div className="w-1/4 bg-card shadow-md py-1 flex flex-col">
        <div className="m-2">
          <TinyTextField
            value={query}
            onChange={setQuery}
            onEnter={handleSearch}
            placeholder={`${t("search")}...`}
          />
        </div>
        <div className="overflow-y-auto flex-grow">
          {stat ? (
            <>
              <Link
                className="inline-flex items-center mx-3"
                onClick={() => setStat(false)}
              >
                <MdArrowBackIos size="0.8em" /> All
              </Link>
              <Panel
                label="Search Result"
                list={result}
                controller={controller}
                forceOpen
              />
            </>
          ) : (
            <>
              <Panel
                label="Installed"
                list={installed}
                controller={controller}
                open
              />
              <Panel
                label="Recommended"
                list={recommended}
                controller={controller}
              />
              <Panel label="All" list={all} controller={controller} />
            </>
          )}
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
                <p className="font-semibold text-lg">{current.meta.name}</p>
                <p className="text-shallow text-xs">ID: {current.id}</p>
              </div>
              {pending && <Spin />}
              {extStat === "notInstalled" && (
                <Button
                  onClick={handleInstall}
                  variant="pill"
                  disabled={pending}
                >
                  Add to Epherome
                </Button>
              )}
              {extStat === "installed" && (
                <Button
                  className="bg-red-400 hover:bg-red-500 active:bg-red-600"
                  onClick={handleUninstall}
                  variant="pill"
                  disabled={pending}
                >
                  Remove from Epherome
                </Button>
              )}
              {extStat === "reloadRequiredToIn" && (
                <>
                  <p className="text-shallow text-sm">Added</p>
                  <Button
                    className="bg-green-400 hover:bg-green-500 active:bg-green-600"
                    onClick={handleReload}
                    variant="pill"
                    disabled={pending}
                  >
                    Reload Required
                  </Button>
                </>
              )}
              {extStat === "reloadRequiredToUn" && (
                <>
                  <p className="text-shallow text-sm">Removed</p>
                  <Button
                    className="bg-green-400 hover:bg-green-500 active:bg-green-600"
                    onClick={handleReload}
                    variant="pill"
                    disabled={pending}
                  >
                    Reload Required
                  </Button>
                </>
              )}
            </div>
            <ReactMarkdown className="p-3">
              {current.meta.introduction
                ? Buffer.from(current.meta.introduction, "base64").toString()
                : "No Introduction"}
            </ReactMarkdown>
          </div>
        ) : (
          <Center className="text-shallow">Not Selected</Center>
        )}
      </div>
    </div>
  );
}
