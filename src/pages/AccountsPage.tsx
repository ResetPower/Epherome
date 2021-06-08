import { Component } from "react";
import Tooltip from "../components/Tooltip";
import IconButton from "../components/IconButton";
import Radio from "../components/Radio";
import Container from "../components/Container";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { MinecraftAccount } from "../renderer/accounts";
import { t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyProps, EmptyState } from "../tools/types";
import List from "../components/List";
import ListItem from "../components/ListItem";
import ListItemText from "../components/ListItemText";
import Alert from "../components/Alert";
import { showDialog } from "../renderer/overlay";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";

export default class AccountsPage extends Component<EmptyProps, EmptyState> {
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
            <Icon>create</Icon> {t("create")}
          </Button>
        </div>
        {accounts.length === 0 && <Alert severity="info">{t("noAccountsYet")}</Alert>}
        <List className="pl-3">
          {accounts.map((i: MinecraftAccount) => (
            <ListItem key={i.id}>
              <Radio
                checked={ephConfigs.selectedAccount === i.id}
                className="self-center mr-3"
                onChange={(checked: boolean) =>
                  checked
                    ? (() => {
                        setConfig(() => (ephConfigs.selectedAccount = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={t(i.mode)} className="flex-grow" />
              <Tooltip title={t("remove")}>
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
                  <Icon>delete</Icon>
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }
}
