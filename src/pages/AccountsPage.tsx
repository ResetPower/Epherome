import { Component } from "react";
import Tooltip from "../components/Tooltip";
import IconButton from "../components/IconButton";
import Radio from "../components/Radio";
import Container from "../components/Container";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { MinecraftAccount } from "../renderer/accounts";
import { t } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyProps } from "../tools/types";
import List from "../components/List";
import ListItem from "../components/ListItem";
import ListItemText from "../components/ListItemText";
import ListItemTrailing from "../components/ListItemTrailing";
import Alert from "../components/Alert";
import { showDialog } from "../renderer/overlay";
import { CreateAccountDialog } from "../components/Dialogs";

// TODO MISSING DIALOGS (CREATE ACCOUNT DIALOG, REMOVE ACCOUNT DIALOG)

export interface AccountsPageState {
  clicked: number;
}

export default class AccountsPage extends Component<EmptyProps, AccountsPageState> {
  state: AccountsPageState = {
    clicked: 0,
  };
  constructor(props: EmptyProps) {
    super(props);
  }
  render(): JSX.Element {
    const accounts = ephConfigs.accounts;
    return (
      <Container className="eph-page">
        <Paragraph padding="both">
          <Button
            variant="contained"
            onClick={() =>
              showDialog((close) => (
                <CreateAccountDialog
                  updateAccounts={() => this.setState({})}
                  open={false}
                  onClose={close}
                />
              ))
            }
          >
            <Icon>create</Icon> {t("create")}
          </Button>
        </Paragraph>
        {accounts.length === 0 && (
          <Paragraph padding="top">
            <Alert severity="info">{t("noAccountsYet")}</Alert>
          </Paragraph>
        )}
        <List>
          {accounts.map((i: MinecraftAccount) => (
            <ListItem key={i.id}>
              <Radio
                checked={ephConfigs.selectedAccount === i.id}
                onChange={(checked: boolean) =>
                  checked
                    ? (() => {
                        console.log("onchanged!");
                        setConfig(() => (ephConfigs.selectedAccount = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={t(i.mode)} />
              <ListItemTrailing>
                <Tooltip title={t("remove")}>
                  <IconButton
                    onClick={() => {
                      this.setState({
                        clicked: i.id,
                      });
                    }}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </Tooltip>
              </ListItemTrailing>
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }
}
