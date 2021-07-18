import { Tooltip, Alert, Container } from "../components/layouts";
import { IconButton, Radio, Button } from "../components/inputs";
import { MinecraftAccount } from "../struct/accounts";
import { logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";
import { MdCreate, MdDelete } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";

export default function AccountsPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const accounts = ephConfigs.accounts;

  return (
    <Container>
      <div className="my-3">
        <Button
          variant="contained"
          onClick={() =>
            GlobalOverlay.showDialog((close) => (
              <CreateAccountDialog updateAccounts={forceUpdate} onClose={close} />
            ))
          }
        >
          <MdCreate /> {t.create}
        </Button>
      </div>
      {accounts.length === 0 && <Alert severity="info">{t.noAccountsYet}</Alert>}
      <List>
        {accounts.map((i: MinecraftAccount) => (
          <ListItem key={i.id}>
            <Radio
              checked={ephConfigs.selectedAccount === i.id}
              className="self-center mr-3"
              onChange={(checked: boolean) =>
                checked
                  ? (() => {
                      logger.info(`Account selection changed to id ${i.id}`);
                      setConfig(() => (ephConfigs.selectedAccount = i.id));
                      forceUpdate();
                    })()
                  : null
              }
            />
            <ListItemText primary={i.name} secondary={t[i.mode]} className="flex-grow" />
            <Tooltip title={t.remove}>
              <IconButton
                onClick={() =>
                  GlobalOverlay.showDialog((close) => (
                    <RemoveAccountDialog updateAccounts={forceUpdate} onClose={close} id={i.id} />
                  ))
                }
              >
                <MdDelete />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
