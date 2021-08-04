import { Alert, Typography } from "../components/layouts";
import { Button, Select, TextField } from "../components/inputs";
import {
  createAccount,
  CreateAccountImplResult,
  MinecraftAccount,
  removeAccount,
} from "../struct/accounts";
import { configStore, setConfig } from "../struct/config";
import { MdCreate, MdDelete } from "react-icons/md";
import { List, ListItem } from "../components/lists";
import { showDialog } from "../renderer/overlays";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useState } from "react";
import { DefaultFn } from "../tools";
import Spin from "../components/Spin";
import { t } from "../intl";
import { _ } from "../tools/arrays";
import { ConfirmDialog } from "../components/Dialog";
import { observer } from "mobx-react";

export function RemoveAccountDialog(props: {
  account: MinecraftAccount;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t("account.removing")}
      message={t("confirmRemoving")}
      action={() => removeAccount(props.account)}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t("remove")}
    />
  );
}

export function CreateAccountFragment(props: {
  onDone: DefaultFn;
}): JSX.Element {
  const [errAlert, setErrAlert] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [msAccNoMcAlert, setMsAccNoMcAlert] = useState(false);
  const [value, setValue] = useState("mojang");
  const [authserver, setAuthserver] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = () => {
    setLoading(true);
    setErrAlert(false);
    setMsAccNoMcAlert(false);
    createAccount(value, name, password, authserver).then(
      (value: CreateAccountImplResult) => {
        setLoading(false);
        if (value.success) {
          props.onDone();
        } else {
          if (value.message === "msAccNoMinecraft") {
            setMsAccNoMcAlert(true);
          } else {
            setErrAlert(true);
          }
        }
      }
    );
  };

  return (
    <div className="p-3">
      <div className="space-y-3">
        {errAlert && (
          <div className="my-3">
            <Alert severity="warn">{t("account.errCreating")}</Alert>
          </div>
        )}
        {msAccNoMcAlert && (
          <div className="my-3">
            <Alert severity="warn">{t("account.msAccNoMinecraft")}</Alert>
          </div>
        )}
        <Select value={value} onChange={setValue}>
          <option value={"mojang"}>{t("account.mojang")}</option>
          <option value={"microsoft"}>{t("account.microsoft")}</option>
          <option value={"authlib"}>{t("account.authlib")}</option>
          <option value={"offline"}>{t("account.offline")}</option>
        </Select>
        <div hidden={value !== "mojang"}>
          <TextField label={t("email")} value={name} onChange={setName} />
          <TextField
            label={t("password")}
            value={password}
            onChange={setPassword}
            type="password"
          />
        </div>
        <div hidden={value !== "microsoft"}>
          <Typography>{t("account.clickToLogin")}</Typography>
        </div>
        <div hidden={value !== "authlib"}>
          <TextField
            label={t("authserver")}
            value={authserver}
            onChange={setAuthserver}
          />
          <TextField label={t("email")} value={name} onChange={setName} />
          <TextField
            label={t("password")}
            value={password}
            onChange={setPassword}
            type="password"
          />
        </div>
        <div hidden={value !== "offline"}>
          <TextField label={t("username")} value={name} onChange={setName} />
        </div>
      </div>
      <div className="flex">
        <div className="flex-grow">{isLoading && <Spin />}</div>
        <Button className="text-shallow" onClick={props.onDone}>
          {t("cancel")}
        </Button>
        <Button disabled={isLoading} onClick={handleCreate}>
          {t("create")}
        </Button>
      </div>
    </div>
  );
}

const AccountsPage = observer(() => {
  const [creating, setCreating] = useState(false);
  const handleCreate = () => setCreating(true);
  const handleRemove = (selected: MinecraftAccount) =>
    showDialog((close) => (
      <RemoveAccountDialog onClose={close} account={selected} />
    ));

  const accounts = configStore.accounts;
  const current = _.selected(accounts);

  return (
    <div className="flex eph-h-full">
      <div className="overflow-y-auto bg-card z-10 shadow-md py-3 w-1/4">
        <div className="flex p-2 flex-wrap">
          <Button variant="contained" onClick={handleCreate}>
            <MdCreate />
            {t("create")}
          </Button>
        </div>
        <List className="space-y-3">
          {accounts.map((i: MinecraftAccount, index) => (
            <ListItem
              className="p-3 mx-2 rounded-lg"
              checked={!creating && current === i}
              onClick={() => {
                creating && setCreating(false);
                i.selected
                  ? setConfig(() => _.deselect(accounts))
                  : setConfig(() => _.select(accounts, i));
              }}
              key={index}
            >
              <Typography className="flex space-x-1">{i.name}</Typography>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="flex-grow p-6 w-3/4">
        {creating ? (
          <CreateAccountFragment onDone={() => setCreating(false)} />
        ) : current ? (
          <TabController orientation="horizontal">
            <TabBar>
              <TabBarItem value={0}>{t("general")}</TabBarItem>
              <TabBarItem value={1}>{t("edit")}</TabBarItem>
            </TabBar>
            <TabBody>
              <div className="flex flex-col">
                <div className="flex-grow">
                  <Typography>{current?.name}</Typography>
                  <Typography>
                    {current && t(`account.${current.mode}`)}
                  </Typography>
                </div>
                <div className="flex justify-end">
                  <Button
                    className="text-red-500"
                    onClick={() => current && handleRemove(current)}
                  >
                    <MdDelete /> {t("remove")}
                  </Button>
                </div>
              </div>
              <div>
                <Typography>{t("notSupportedYet")}</Typography>
              </div>
            </TabBody>
          </TabController>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-shallow">{t("account.notSelected")}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default AccountsPage;
