import { Alert } from "../components/layouts";
import { Button, Select, TextField } from "../components/inputs";
import {
  createAccount,
  CreateAccountImplResult,
  MinecraftAccount,
  removeAccount,
} from "../struct/accounts";
import { configStore, setConfig } from "../struct/config";
import { MdCreate, MdDelete, MdEdit } from "react-icons/md";
import { List, ListItem } from "../components/lists";
import { showOverlay } from "../renderer/overlays";
import {
  TabBar,
  TabBarItem,
  TabBody,
  TabContext,
  TabController,
} from "../components/tabs";
import { useState } from "react";
import { adapt, DefaultFn, unwrapFunction } from "../tools";
import Spin from "../components/Spin";
import { t } from "../intl";
import { _ } from "../tools/arrays";
import {
  ConfirmDialog,
  ExportedDialog,
  showInternetNotAvailableDialog,
  showNotSupportedDialog,
} from "../components/Dialog";
import { observer } from "mobx-react";
import { useRef } from "react";
import { Avatar, Body, downloadSkin, steveId } from "../craft/skin";
import { BiExport } from "react-icons/bi";

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
      positiveClassName="text-danger"
      positiveText={t("remove")}
    />
  );
}

export function ChangeAccountFragment(props: {
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
          unwrapFunction(props.onDone)();
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
          <p>{t("account.clickToLogin")}</p>
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

export function AccountSkinFragment(props: {
  current: MinecraftAccount;
}): JSX.Element {
  const [exporting, setExporting] = useState(false);
  const uuid = props.current.uuid;

  const handleExport = () => {
    setExporting(true);
    downloadSkin(uuid)
      .then((target) => {
        setExporting(false);
        showOverlay((close) => (
          <ExportedDialog target={target} close={close} />
        ));
      })
      .catch(() => {
        setExporting(false);
        showInternetNotAvailableDialog();
      });
  };
  const handleEdit = showNotSupportedDialog;

  return (
    <div className="flex justify-center space-x-9">
      <Body uuid={uuid} />
      <div>
        <Button disabled={exporting} onClick={handleExport}>
          {exporting ? <Spin indent /> : <BiExport />} {t("export")}
        </Button>
        <Button onClick={handleEdit}>
          <MdEdit /> {t("edit")}
        </Button>
      </div>
    </div>
  );
}

const AccountsPage = observer(() => {
  const tabRef = useRef<TabContext>();
  const [creating, setCreating] = useState(false);
  const handleCreate = () => setCreating(true);
  const handleRemove = (selected: MinecraftAccount) =>
    showOverlay((close) => (
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
          {_.map(accounts, (i, id) => (
            <ListItem
              className="p-3 mx-2 rounded-lg"
              checked={!creating && current === i}
              onClick={() => {
                creating && setCreating(false);
                i.selected
                  ? setConfig(() => _.deselect(accounts))
                  : setConfig(() => _.select(accounts, i));
                tabRef.current?.setValue(0);
              }}
              key={id}
            >
              {adapt(["mojang", "microsoft"], i.mode) ? (
                <Avatar uuid={i.uuid} />
              ) : (
                i.mode === "offline" && <Avatar uuid={steveId} />
              )}
              <p className="flex px-1 space-x-1">{i.name}</p>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="flex-grow p-6 w-3/4">
        {creating ? (
          <ChangeAccountFragment onDone={() => setCreating(false)} />
        ) : current ? (
          <TabController orientation="horizontal" contextRef={tabRef}>
            <TabBar>
              <TabBarItem value={0}>{t("general")}</TabBarItem>
              <TabBarItem value={1}>{t("account.skin")}</TabBarItem>
            </TabBar>
            <TabBody>
              <div className="flex flex-col">
                <div className="flex-grow">
                  <p>{current?.name}</p>
                  <p>{current && t(`account.${current.mode}`)}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    className="text-danger"
                    onClick={() => current && handleRemove(current)}
                  >
                    <MdDelete /> {t("remove")}
                  </Button>
                </div>
              </div>
              {current.mode === "mojang" ? (
                <AccountSkinFragment current={current} />
              ) : (
                <p>{t("account.skin.notSupportedExcludeMojang")}</p>
              )}
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
