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
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";
import { MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { Alert } from "@material-ui/lab";

const useStyle = makeStyles({
  text: {
    userSelect: "none",
  },
});

export default function ProfilesPage(): FunctionComponentElement<EmptyProps> {
  const classes = useStyle();
  const [selected, setSelected] = useConfigState("selectedProfile", 0);
  const [clicked, setClicked] = useState(0);
  const [profiles, _setProfiles, updateProfiles] = useConfigState<MinecraftProfile[]>(
    "profiles",
    []
  );
  const [createDialog, openCreateDialog, closeCreateDialog] = useBooleanState(false);
  const [editDialog, openEditDialog, closeEditDialog] = useBooleanState(false);
  const [removeDialog, openRemoveDialog, closeRemoveDialog] = useBooleanState(false);

  return (
    <Container className="eph-page">
      <Paragraph padding="both">
        <Button variant="contained" color="secondary" onClick={openCreateDialog}>
          <Icon>create</Icon> {t("create")}
        </Button>
      </Paragraph>
      {profiles.length === 0 && (
        <Paragraph padding="top">
          <Alert severity="info">{t("noProfilesYet")}</Alert>
        </Paragraph>
      )}
      <List>
        {profiles.map((i: MinecraftProfile) => (
          <ListItem key={i.id}>
            <Radio
              checked={selected === i.id}
              onChange={(_ev: React.ChangeEvent, checked: boolean) =>
                checked ? setSelected(i.id) : null
              }
            />
            <ListItemText
              className={classes.text}
              primary={i.name}
              secondary={`${i.dir} ${i.ver}`}
            />
            <ListItemSecondaryAction>
              <Tooltip title={t("edit")}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setClicked(i.id);
                    openEditDialog();
                  }}
                >
                  <Icon>edit</Icon>
                </IconButton>
              </Tooltip>
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
      <CreateProfileDialog
        open={createDialog}
        onClose={closeCreateDialog}
        updateProfiles={updateProfiles}
      />
      <EditProfileDialog
        open={editDialog}
        id={clicked}
        onClose={closeEditDialog}
        updateProfiles={updateProfiles}
      />
      <RemoveProfileDialog
        open={removeDialog}
        onClose={closeRemoveDialog}
        updateProfiles={updateProfiles}
        id={clicked}
      />
    </Container>
  );
}
