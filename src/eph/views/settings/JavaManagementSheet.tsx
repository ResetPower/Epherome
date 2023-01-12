import {
  Button,
  Hyperlink,
  IconButton,
  List,
  TextField,
  TinyTextField,
} from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { createJava, removeJava } from "common/struct/java";
import { apply } from "common/utils";
import { _ } from "common/utils/arrays";
import { checkJava } from "core/java";
import { findJavaHome, parseJavaExecutablePath } from "core/java/finder";
import { ipcRenderer } from "electron";
import RadioButton from "eph/components/RadioButton";
import { t } from "eph/intl";
import { overlayStore } from "eph/overlay";
import { historyStore } from "eph/renderer/history";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaJava } from "react-icons/fa";
import { MdClose, MdDoneOutline, MdEdit, MdFolderOpen } from "react-icons/md";

const JavaManagementSheet = observer(() => {
  const [editing, setEditing] = useState("");
  const [nickname, setNickname] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [newJavaPath, setNewJavaPath] = useState("");
  const javas = configStore.javas;

  const checkDuplicate = (dir: string) => {
    if (dir === "") {
      setErr(t("java.invalidPath"));
      return false;
    }
    for (const i of javas) {
      if (i.dir === dir) {
        setErr(t("java.duplicatePath"));
        return true;
      }
    }
    return false;
  };
  const handleAddJava = async (value?: string, save = true) => {
    try {
      const val = parseJavaExecutablePath(value ?? newJavaPath);
      if (checkDuplicate(val)) return;
      const java = await checkJava(val);
      if (java) {
        createJava(java, save);
        setNewJavaPath("");
      } else setErr(t("java.invalidPath"));
    } catch {
      setErr(t("java.invalidPath"));
    }
  };
  const submitNickname = () => {
    setConfig((cfg) =>
      apply(
        cfg.javas.find((v) => v.nanoid === editing),
        (j) => (j.nickname = nickname ? nickname : undefined)
      )
    );
    setEditing("");
    setNickname("");
  };

  return (
    <div className="flex flex-col overflow-hidden px-9 m-1">
      <List className="overflow-y-auto flex-grow">
        {javas.map((value, index) => (
          <div className="flex items-center space-x-2" key={index}>
            <RadioButton
              active={_.selected(javas) === value}
              onClick={() => setConfig(() => _.select(javas, value))}
            />
            <div className="flex flex-col flex-grow w-3/4">
              <div className="flex">
                {editing === value.nanoid ? (
                  <div className="flex flex-grow">
                    <TinyTextField
                      value={nickname}
                      onEnter={submitNickname}
                      onChange={setNickname}
                      placeholder={t("java.nickName")}
                    />
                  </div>
                ) : (
                  value.nickname && (
                    <p className="flex-grow">{value.nickname}</p>
                  )
                )}
                <p className={value.nickname && "text-shallow"}>
                  {value.name +
                    " (" +
                    t("java.bitNumber", value.is64Bit ? "64" : "32") +
                    ") "}
                </p>
              </div>
              <p className="text-shallow text-sm overflow-ellipsis break-all">
                {value.dir}
              </p>
            </div>
            {editing === value.nanoid ? (
              <IconButton onClick={submitNickname}>
                <MdDoneOutline />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  setEditing(value.nanoid);
                  if (value.nickname) {
                    setNickname(value.nickname);
                  }
                }}
              >
                <MdEdit />
              </IconButton>
            )}
            <IconButton onClick={() => removeJava(value)}>
              <MdClose />
            </IconButton>
          </div>
        ))}
      </List>
      <div className="mt-3">
        <TextField
          value={newJavaPath}
          onChange={(ev) => {
            setNewJavaPath(ev);
            setErr("");
          }}
          error={!!err}
          helperText={err ?? undefined}
          icon={<FaJava />}
          placeholder={t("java.executablePath")}
          trailing={
            <>
              <Hyperlink
                button
                className="border-r border-divider pr-3"
                onClick={() =>
                  ipcRenderer.invoke("open-java").then((value) => {
                    value && handleAddJava(value);
                  })
                }
              >
                <MdFolderOpen />
              </Hyperlink>
              <Hyperlink button className="pl-3" onClick={handleAddJava}>
                {t("add")}
              </Hyperlink>
            </>
          }
        />
        <div className="flex">
          <Button
            onClick={() => {
              try {
                findJavaHome().then((javas) =>
                  javas.forEach((i) => handleAddJava(i, false))
                );
                configStore.save();
              } catch {
                setErr(t("java.invalidPath"));
              }
            }}
          >
            {t("java.detect")}
          </Button>
          <div className="flex-grow" />
          <Button
            onClick={() => {
              historyStore.push("java.installJava");
              overlayStore.close();
            }}
          >
            {t("java.installJava")}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default JavaManagementSheet;
