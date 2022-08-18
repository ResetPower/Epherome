import { ListItem } from "@resetpower/rcs";
import { personalStore } from "common/stores/personal";
import { configStore } from "common/struct/config";
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
import path from "path";

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
    personalStore.logout();
    historyStore.back();
  };
  const handleChangeAvatar = () => {
    setStat(true);
    ipcRenderer.invoke("open-image").then((file) => {
      if (file) {
        const content = fs.readFileSync(file);
        const ext = path.extname(file).slice(1);
        const byteLength = content.byteLength;
        if (byteLength >= 256000) {
          showOverlay({
            title: t("warning"),
            message: t("imageTooBig"),
          });
          return;
        }
        got
          .put(`https://api.epherome.com/users/avatar/${userInfo.uuid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `image/${ext}`,
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
                ? `HTTP ${err.response.statusCode}`
                : t("internetNotAvailable"),
            });
            console.error(err);
          });
      } else {
        setStat(false);
      }
    });
  };

  return (
    <div className="m-6 py-3 bg-card rounded-md border border-divider">
      <div className="px-3">
        <PersonalTile userInfo={userInfo} bottomPop />
      </div>
      <JoinIn
        className="border-y border-divider"
        separator={<div className="border-t border-divider" />}
      >
        <Tile onClick={handleChangeAvatar} disabled={stat}>
          {t("personal.changeAvatar")}...
        </Tile>
        <Tile onClick={handleLogout} danger>
          {t("personal.logout")}
        </Tile>
      </JoinIn>
    </div>
  );
}
