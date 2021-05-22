import React, { Component } from "react";
import {
  Button,
  Container,
  Icon,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Radio,
  Tooltip,
} from "@material-ui/core";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";
import { MinecraftAccount } from "../renderer/accounts";
import { t } from "../renderer/global";
import { Alert } from "@material-ui/lab";
import Paragraph from "../components/Paragraph";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyProps } from "../tools/types";

export interface AccountsPageState {
  clicked: number;
  createDialog: boolean;
  removeDialog: boolean;
}

export default class AccountsPage extends Component<EmptyProps, AccountsPageState> {
  state: AccountsPageState = {
    clicked: 0,
    createDialog: false,
    removeDialog: false,
  };
  constructor(props: EmptyProps) {
    super(props);
  }
  render() {
    const accounts = ephConfigs.accounts;
    return (
      <Container className="eph-page">
        <Paragraph padding="both">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.setState({ createDialog: true })}
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
                onChange={(_ev: React.ChangeEvent, checked: boolean) =>
                  checked
                    ? (() => {
                        setConfig(() => (ephConfigs.selectedAccount = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={t(i.mode)} />
              <ListItemSecondaryAction>
                <Tooltip title={t("remove")}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      this.setState({
                        clicked: i.id,
                        removeDialog: true,
                      });
                    }}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateAccountDialog
          open={this.state.createDialog}
          onClose={() => this.setState({ createDialog: false })}
          updateAccounts={() => this.setState({})}
        />
        <RemoveAccountDialog
          open={this.state.removeDialog}
          onClose={() => this.setState({ removeDialog: false })}
          updateAccounts={() => this.setState({})}
          id={this.state.clicked}
        />
      </Container>
    );
  }
}
