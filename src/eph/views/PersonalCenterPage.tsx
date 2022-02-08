import { ListItem } from "@resetpower/rcs";
import { personalStore } from "common/stores/personal";
import { configStore, setConfig } from "common/struct/config";
import { DefaultFn } from "common/utils";
import { ipcRenderer } from "electron";
import JoinIn from "eph/components/JoinIn";
import { PersonalTile } from "eph/components/PersonalPanel";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { historyStore } from "eph/renderer/history";
import got from "got";
import fs from "fs";
import { ReactNode, useState } from "react";

function Tile(props: {
  onClick: DefaultFn;
  className?: string;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}): JSX.Element {
  return (
    <ListItem
      className={`${props.danger && "text-danger"} ${
        props.disabled && !props.danger && "text-shallow"
      } ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled}
      dependent
    >
      {props.children}
    </ListItem>
  );
}

export default function PersonalCenterPage(): JSX.Element {
  const token = configStore.epheromeToken;
  const userInfo = personalStore.userInfo;
  const [stat, setStat] = useState(false);

  if (!userInfo) {
    return (
      <div>
        <p>NOT LOGGED IN</p>
      </div>
    );
  }

  const handleLogout = () => {
    setConfig((cfg) => (cfg.epheromeToken = ""));
    historyStore.back();
  };
  const handleChangeAvatar = () => {
    setStat(true);
    ipcRenderer.invoke("open-avatar").then((file) => {
      if (file) {
        const content = fs.readFileSync(file);
        const byteLength = content.byteLength;
        if (byteLength >= 256000) {
          showOverlay({
            title: t("warning"),
            message: "Image size should not bigger than 256KB.",
          });
          return;
        }
        got
          .post("https://epherome.com/api/set-head", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `image/png`,
              "Content-Length": `${byteLength}`,
            },
            body: content,
          })
          .then(() => {
            personalStore.updateHead();
            setStat(false);
          })
          .catch((err) => {
            setStat(false);
            showOverlay({
              title: t("errorOccurred"),
              message: err.response
                ? JSON.parse(err.response.body).message
                : t("internetNotAvailable"),
            });
          });
      } else {
        setStat(false);
      }
    });
  };

  return (
    <div className="m-6 py-3 bg-card rounded-md border border-divider">
      <div className="px-3">
        <PersonalTile bottomPop />
      </div>
      <JoinIn
        className="border-y border-divider"
        separator={<div className="border-t border-divider" />}
      >
        <Tile onClick={handleChangeAvatar} disabled={stat}>
          Change Avatar...
        </Tile>
        <Tile onClick={handleLogout} danger>
          Logout
        </Tile>
      </JoinIn>
    </div>
  );
}
