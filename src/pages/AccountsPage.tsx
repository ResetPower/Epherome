import { Typography } from "../components/layouts";
import { Button } from "../components/inputs";
import { getAccount, MinecraftAccount } from "../struct/accounts";
import { logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";
import { MdCreate, MdDelete } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useCallback } from "react";

export default function AccountsPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const accounts = ephConfigs.accounts;
  const selected = ephConfigs.selectedAccount;
  const createAccount = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <CreateAccountDialog updateAccounts={forceUpdate} onClose={close} />
      )),
    [forceUpdate]
  );
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
      <TabController className="flex-grow p-3" orientation="horizontal">
        <TabBar>
          <TabBarItem value={0}>{t.general}</TabBarItem>
          <TabBarItem value={1}>{t.edit}</TabBarItem>
        </TabBar>
        <TabBody>
          <div className="flex flex-col">
            <div className="flex-grow">
              <Typography>ID: {current?.id}</Typography>
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
    </div>
  );
}
