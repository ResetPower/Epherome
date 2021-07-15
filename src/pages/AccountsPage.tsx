import { Component } from "react";
import Tooltip from "../components/Tooltip";
import IconButton from "../components/IconButton";
import Radio from "../components/Radio";
import Button from "../components/Button";
import { MinecraftAccount } from "../struct/accounts";
import { logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyObject } from "../tools/types";
import ListItemText from "../components/ListItemText";
import Alert from "../components/Alert";
import { showDialog } from "../renderer/overlay";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";
import { MdCreate, MdDelete } from "react-icons/md";
import Container from "../components/Container";
import List from "../components/List";
import ListItem from "../components/ListItem";

export default class AccountsPage extends Component<EmptyObject, EmptyObject> {
  render(): JSX.Element {
    const accounts = ephConfigs.accounts;
    return (
      <Container>
        <div className="my-3">
          <Button
            variant="contained"
            onClick={() =>
              showDialog((close) => (
                <CreateAccountDialog updateAccounts={() => this.setState({})} onClose={close} />
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
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={t[i.mode]} className="flex-grow" />
              <Tooltip title={t.remove}>
                <IconButton
                  onClick={() =>
                    showDialog((close) => (
                      <RemoveAccountDialog
                        updateAccounts={() => this.setState({})}
                        onClose={close}
                        id={i.id}
                      />
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
}
