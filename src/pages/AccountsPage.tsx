import { Alert, Typography } from "../components/layouts";
import { Button, Select, TextField } from "../components/inputs";
import {
  createAccount,
  CreateAccountImplResult,
  getAccount,
  MinecraftAccount,
} from "../struct/accounts";
import { logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { RemoveAccountDialog } from "../components/Dialogs";
import { MdCreate, MdDelete } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useController, useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useCallback } from "react";
import { useState } from "react";
import { DefaultFunction } from "../tools/types";
import Spin from "../components/Spin";

export function CreateAccountFragment(props: { onDone: DefaultFunction }): JSX.Element {
  const [errAlert, setErrAlert] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [msAccNoMcAlert, setMsAccNoMcAlert] = useState(false);
  const valueController = useController("mojang");
  const authserverController = useController("");
  const nameController = useController("");
  const passwordController = useController("");

  const handleCreate = useCallback(() => {
    setLoading(true);
    setErrAlert(false);
    setMsAccNoMcAlert(false);
    createAccount(
      valueController.value,
      nameController.value,
      passwordController.value,
      authserverController.value
    ).then((value: CreateAccountImplResult) => {
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
    });
  }, [
    authserverController.value,
    nameController.value,
    passwordController.value,
    props,
    valueController.value,
  ]);

  return (
    <>
      <Typography className="text-xl font-semibold">{t.newAccount}</Typography>
      <div>
        {errAlert && (
          <div className="my-3">
            <Alert severity="warn">{t.errCreatingAccount}</Alert>
          </div>
        )}
        {msAccNoMcAlert && (
          <div className="my-3">
            <Alert severity="warn">{t.msAccNoMinecraft}</Alert>
          </div>
        )}
        <Select {...valueController}>
          <option value={"mojang"}>{t.mojang}</option>
          <option value={"microsoft"}>{t.microsoft}</option>
          <option value={"authlib"}>{t.authlib}</option>
          <option value={"offline"}>{t.offline}</option>
        </Select>
        <div hidden={valueController.value !== "mojang"}>
          <TextField label={t.email} {...nameController} />
          <TextField label={t.password} {...passwordController} type="password" />
        </div>
        <div hidden={valueController.value !== "microsoft"}>
          <Typography>{t.clickToLogin}</Typography>
        </div>
        <div hidden={valueController.value !== "authlib"}>
          <TextField label={t.authserver} {...authserverController} />
          <TextField label={t.email} {...nameController} />
          <TextField label={t.password} {...passwordController} type="password" />
        </div>
        <div hidden={valueController.value !== "offline"}>
          <TextField label={t.username} {...nameController} />
        </div>
      </div>
      <div className="flex">
        <div className="flex-grow">{isLoading && <Spin />}</div>
        <Button className="text-shallow" onClick={props.onDone} textInherit>
          {t.cancel}
        </Button>
        <Button disabled={isLoading} onClick={handleCreate}>
          {t.create}
        </Button>
      </div>
    </>
  );
}

export default function AccountsPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const accounts = ephConfigs.accounts;
  const selected = ephConfigs.selectedAccount;
  const [creating, setCreating] = useState(false);
  const createAccount = useCallback(() => setCreating(true), []);
  const removeAccount = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <RemoveAccountDialog updateAccounts={forceUpdate} onClose={close} id={selected} />
      )),
    [forceUpdate, selected]
  );
  const current = getAccount(selected);

  return accounts.length === 0 ? (
    <div className="flex flex-col eph-h-full justify-center items-center">
      <Typography className="text-shallow" textInherit>
        {t.noAccountsYet}
      </Typography>
      <Button variant="contained" onClick={createAccount}>
        <MdCreate />
        {t.create}
      </Button>
    </div>
  ) : (
    <div className="flex eph-h-full">
      <div className="overflow-y-scroll py-3">
        <div>
          <Button variant="contained" onClick={createAccount}>
            <MdCreate />
            {t.create}
          </Button>
        </div>
        <List>
          {accounts.map((i: MinecraftAccount) => (
            <ListItem
              className="px-6 m-1 rounded-lg"
              checked={selected === i.id}
              onClick={() => {
                logger.info(`Account selection changed to id ${i.id}`);
                setConfig(() => (ephConfigs.selectedAccount = i.id));
                forceUpdate();
              }}
              key={i.id}
            >
              <ListItemText primary={i.name} secondary={t[i.mode]} className="flex-grow" />
            </ListItem>
          ))}
        </List>
      </div>
      {creating ? (
        <div className="border-l border-divide p-3">
          <CreateAccountFragment
            onDone={() => {
              setCreating(false);
              forceUpdate();
            }}
          />
        </div>
      ) : (
        <TabController className="flex-grow p-3" orientation="horizontal">
          <TabBar>
            <TabBarItem value={0}>{t.general}</TabBarItem>
            <TabBarItem value={1}>{t.edit}</TabBarItem>
          </TabBar>
          <TabBody>
            <div className="flex flex-col">
              <div className="flex-grow">
                <Typography className="text-shallow" textInherit>
                  ID: {current?.id}
                </Typography>
                <Typography>{current?.name}</Typography>
                <Typography>{current && t[current.mode]}</Typography>
              </div>
              <div className="flex justify-end">
                <Button className="text-red-500" onClick={removeAccount} textInherit>
                  <MdDelete /> {t.remove}
                </Button>
              </div>
            </div>
            <div>
              <Typography>{t.notSupportedYet}</Typography>
            </div>
          </TabBody>
        </TabController>
      )}
    </div>
  );
}
