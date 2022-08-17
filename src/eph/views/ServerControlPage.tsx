import {
  Button,
  Center,
  ListItem,
  ListItemText,
  TextField,
} from "@resetpower/rcs";
import { configStore } from "common/struct/config";
import { createServer } from "common/struct/server";
import { DefaultFn } from "common/utils";
import { _ } from "common/utils/arrays";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { JavaStatusResponse } from "minecraft-server-util";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import ServerManagerFragment from "./ServerManagerFragment";

function CreateServerFragment(props: { onClose: DefaultFn }): JSX.Element {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");

  const handleCreate = () => {
    createServer({ name, ip, edition: "java" });
    props.onClose();
  };

  return (
    <div className="p-3">
      <TextField
        value={name}
        onChange={setName}
        label={t("name")}
        placeholder={t("name")}
        required
      />
      <TextField
        value={ip}
        onChange={setIp}
        label="IP"
        placeholder="IP"
        required
      />

      <div className="flex justify-end my-9">
        <Button onClick={props.onClose} className="text-shallow">
          {t("cancel")}
        </Button>
        <Button onClick={handleCreate} className="text-secondary">
          {t("fine")}
        </Button>
      </div>
    </div>
  );
}

export type PanServerResponse = JavaStatusResponse | undefined | null;

export class ServerResponseStore {
  private data: { [key: string]: PanServerResponse } = {};
  get(ip: string) {
    return this.data[ip];
  }
  put(ip: string, resp: PanServerResponse) {
    this.data[ip] = resp;
  }
}

const ServerControlPage = observer(() => {
  const [creating, setCreating] = useState(false);
  const store = useMemo(() => new ServerResponseStore(), []);

  const servers = configStore.servers;
  const current = _.selected(servers);

  const onRemove = () =>
    showOverlay({
      type: "dialog",
      title: t("remove"),
      message: t("confirmRemoving"),
      cancellable: true,
      dangerous: true,
      action: () => current && _.remove(servers, current),
    });

  return (
    <div className="flex eph-h-full">
      <div className="w-1/4 bg-card">
        <div
          onClick={() => setCreating(true)}
          className={`rcs-hover flex items-center select-none cursor-pointer font-medium p-3 mb-3 ${
            creating && "rcs-hover-active"
          }`}
        >
          <MdAdd /> New Server
        </div>
        {servers.map((value, index) => (
          <ListItem
            active={!creating && value.selected}
            onClick={() =>
              value.selected ? _.deselect(servers) : _.select(servers, value)
            }
            key={index}
            dependent
          >
            <ListItemText
              primary={value.name}
              secondary={value.ip}
            ></ListItemText>
          </ListItem>
        ))}
      </div>
      <div className="flex-grow eph-h-full p-3">
        {creating ? (
          <CreateServerFragment onClose={() => setCreating(false)} />
        ) : current ? (
          <ServerManagerFragment
            store={store}
            server={current}
            onRemove={onRemove}
          />
        ) : (
          <Center>
            <p className="text-shallow">{t("notSelected")}</p>
          </Center>
        )}
      </div>
    </div>
  );
});

export default ServerControlPage;
