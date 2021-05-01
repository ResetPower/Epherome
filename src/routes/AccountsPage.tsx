import React, { FunctionComponentElement, useState } from "react";
import {
  Button,
  Container,
  Icon,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Radio,
  Tooltip,
} from "@material-ui/core";
import { useBooleanState, useConfigState } from "../renderer/hooks";
import { CreateAccountDialog, RemoveAccountDialog } from "../components/Dialogs";
import { MinecraftAccount } from "../renderer/accounts";
import { t } from "../renderer/global";
import { Alert } from "@material-ui/lab";
import Paragraph from "../components/Paragraph";

const useStyle = makeStyles({
  text: {
    userSelect: "none",
  },
});

export default function AccountsPage(): FunctionComponentElement<EmptyProps> {
  const classes = useStyle();
  const [selected, setSelected] = useConfigState("selectedAccount", 0);
  const [clicked, setClicked] = useState(0);
  const [accounts, _setAccounts, updateAccounts] = useConfigState<MinecraftAccount[]>(
    "accounts",
    []
  );
  const [createDialog, openCreateDialog, closeCreateDialog] = useBooleanState(false);
  const [removeDialog, openRemoveDialog, closeRemoveDialog] = useBooleanState(false);

  return (
    <Container className="eph-page">
      <Paragraph padding="both">
        <Button variant="contained" color="secondary" onClick={openCreateDialog}>
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
              checked={selected === i.id}
              onChange={(_ev: React.ChangeEvent, checked: boolean) =>
                checked ? setSelected(i.id) : null
              }
            />
            <ListItemText className={classes.text} primary={i.name} secondary={t(i.mode)} />
            <ListItemSecondaryAction>
              <Tooltip title={t("remove")}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setClicked(i.id);
                    openRemoveDialog();
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
        open={createDialog}
        onClose={closeCreateDialog}
        updateAccounts={updateAccounts}
      />
      <RemoveAccountDialog
        open={removeDialog}
        onClose={closeRemoveDialog}
        updateAccounts={updateAccounts}
        id={clicked}
      />
    </Container>
  );
}
