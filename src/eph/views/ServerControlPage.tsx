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
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { MdAdd } from "react-icons/md";

function CreateServerFragment(props: { onClose: DefaultFn }): JSX.Element {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");

  const handleCreate = () => {
    createServer({ name, ip, edition: "java" });
    props.onClose();
  };

  return (
    <div className="p-9">
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

const ServerControlPage = observer(() => {
  const [creating, setCreating] = useState(false);

  const servers = configStore.servers;
  const current = _.selected(servers);

  return (
    <div className="flex eph-h-full">
      <div className="w-1/4 bg-card">
        <div
          onClick={() => setCreating(true)}
          className={`rcs-hover flex items-center select-none cursor-pointer p-3 mb-3 ${
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
      <div className="flex-grow">
        {creating ? (
          <CreateServerFragment onClose={() => setCreating(false)} />
        ) : (
          <Center>
            <p className="text-shallow">{t("notSupportedYet")}</p>
          </Center>
        )}
      </div>
    </div>
  );
});

export default ServerControlPage;
