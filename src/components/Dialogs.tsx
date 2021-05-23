import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  Box,
  TextField,
  DialogActions,
  Button,
  MenuItem,
  Icon,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { FunctionComponentElement, useState } from "react";
import { t } from "../renderer/global";
import { createAccount, removeAccount } from "../renderer/accounts";
import { createProfile, editProfile, MinecraftProfile, removeProfile } from "../renderer/profiles";
import { getById } from "../tools/arrays";
import { ipcRenderer } from "electron";
import { ephConfigs } from "../renderer/config";
import "../styles/dialogs.css";

export function useBindingState<T>(
  value: T
): [T, (ev: React.ChangeEvent<{ value: unknown }>) => void, (value: T) => void] {
  const state = useState(value);
  return [
    state[0], // state
    (ev: React.ChangeEvent<{ value: unknown }>) => {
      state[1](ev.target.value as T);
    }, // changeState
    (value: T) => {
      state[1](value);
    }, // setState
  ];
}

export interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface CreateAccountDialogProps extends CustomDialogProps {
  updateAccounts: () => void;
}

export interface RemoveAccountDialogProps extends CustomDialogProps {
  updateAccounts: () => void;
  id: number;
}

export interface CreateProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
}

export interface RemoveProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
  id: number;
}

export interface EditProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
  id: number;
}

export interface RequestPasswordDialogProps extends CustomDialogProps {
  again: boolean;
  callback: (password: string) => void;
}

export interface ErrorDialogProps extends CustomDialogProps {
  stacktrace: string;
}

export function CreateAccountDialog(
  props: CreateAccountDialogProps
): FunctionComponentElement<CreateAccountDialogProps> {
  const [isLoading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [value, setValue] = useState("mojang");
  const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
    setValue(ev.target.value as string);
  };
  const handleClose = () => {
    setErrorAlert(false);
    props.onClose();
  };
  const [username, changeUsername] = useBindingState("");
  const [password, changePassword] = useBindingState("");
  const [authserver, changeAuthserver] = useBindingState("");
  const handleCreate = () => {
    setLoading(true);
    setErrorAlert(false);
    createAccount(value, username, password, authserver).then((value: boolean) => {
      setLoading(false);
      if (value) {
        handleClose();
        props.updateAccounts();
      } else {
        setErrorAlert(true);
      }
    });
  };

  return (
    <Dialog onClose={handleClose} open={props.open}>
      <DialogTitle>{t("newAccount")}</DialogTitle>
      <DialogContent className="dialog-content">
        {errorAlert && (
          <div>
            <Alert severity="warning">{t("errCreatingAccount")}</Alert>
            <br />
          </div>
        )}
        <Select value={value} onChange={handleChange}>
          <MenuItem value={"mojang"}>{t("mojang")}</MenuItem>
          <MenuItem value={"microsoft"}>{t("microsoft")}</MenuItem>
          <MenuItem value={"authlib"}>{t("authlib")}</MenuItem>
          <MenuItem value={"offline"}>{t("offline")}</MenuItem>
        </Select>
        <br />
        <br />
        <Box hidden={value !== "mojang"}>
          <TextField label={t("email")} onChange={changeUsername} fullWidth />
          <TextField label={t("password")} onChange={changePassword} type="password" fullWidth />
        </Box>
        <Box hidden={value !== "microsoft"} />
        <Box hidden={value !== "authlib"}>
          <TextField label={t("authserver")} onChange={changeAuthserver} fullWidth />
          <TextField label={t("email")} onChange={changeUsername} fullWidth />
          <TextField label={t("password")} onChange={changePassword} type="password" fullWidth />
        </Box>
        <Box hidden={value !== "offline"}>
          <TextField label={t("username")} onChange={changeUsername} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button color="default" disabled={isLoading} onClick={handleCreate}>
          {t("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RemoveAccountDialog(
  props: RemoveAccountDialogProps
): FunctionComponentElement<RemoveAccountDialogProps> {
  const handleRemove = () => {
    removeAccount(props.id);
    props.onClose();
    props.updateAccounts();
  };
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("removeAccount")}</DialogTitle>
      <DialogContent className="dialog-content">{t("confirmRemoving")}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="secondary" onClick={handleRemove}>
          {t("remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CreateProfileDialog(
  props: CreateProfileDialogProps
): FunctionComponentElement<CreateProfileDialogProps> {
  const [name, changeName] = useBindingState("");
  const [dir, changeDir, setDir] = useBindingState("");
  const [ver, changeVer] = useBindingState("");
  const handleCreate = () => {
    const rs = createProfile(name, dir, ver);
    if (rs) {
      props.onClose();
      props.updateProfiles();
    }
  };
  const handleOpenDirectory = () => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => {
      setDir(arg);
    });
    ipcRenderer.send("openDirectory");
  };

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("newProfile")}</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField label={t("name")} value={name} onChange={changeName} fullWidth />
        <TextField
          label={t("directory")}
          value={dir}
          onChange={changeDir}
          helperText={t("usuallyDotMinecraftEtc")}
          fullWidth
        />
        <TextField label={t("version")} value={ver} onChange={changeVer} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleOpenDirectory}>
          <Icon>folder</Icon> {t("openDirectory")}
        </Button>
        <div className="eph-space"></div>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="default" onClick={handleCreate}>
          {t("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function EditProfileDialog(
  props: EditProfileDialogProps
): FunctionComponentElement<EditProfileDialogProps> {
  const old = getById<MinecraftProfile>(ephConfigs.profiles, props.id) ?? {
    id: -1,
    name: "",
    dir: "",
    ver: "",
  };
  const [name, changeName] = useBindingState(old.name);
  const [dir, changeDir] = useBindingState(old.dir);
  const [ver, changeVer] = useBindingState(old.ver);
  const handleCreate = () => {
    const rs = editProfile(props.id, name, dir, ver);
    if (rs) {
      props.onClose();
      props.updateProfiles();
    }
  };

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("editProfile")}</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField label={t("name")} value={name} onChange={changeName} fullWidth />
        <TextField
          label={t("directory")}
          value={dir}
          onChange={changeDir}
          helperText={t("usuallyDotMinecraftEtc")}
          fullWidth
        />
        <TextField label={t("version")} value={ver} onChange={changeVer} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="default" onClick={handleCreate}>
          {t("edit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RemoveProfileDialog(
  props: RemoveProfileDialogProps
): FunctionComponentElement<RemoveProfileDialogProps> {
  const handleRemove = () => {
    removeProfile(props.id);
    props.onClose();
    props.updateProfiles();
  };
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("removeProfile")}</DialogTitle>
      <DialogContent className="dialog-content">{t("confirmRemoving")}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="secondary" onClick={handleRemove}>
          {t("remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RequestPasswordDialog(
  props: RequestPasswordDialogProps
): FunctionComponentElement<RequestPasswordDialogProps> {
  const [password, changePassword] = useBindingState("");
  const handler = () => {
    props.onClose();
    props.callback(password);
  };
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t("pleaseInputPassword")}</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          value={password}
          onChange={changePassword}
          label={t("password")}
          type="password"
          helperText={props.again ? t("passwordWrong") : ""}
          error={props.again}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t("cancel")}</Button>
        <Button color="primary" onClick={handler}>
          {t("ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ErrorDialog(props: ErrorDialogProps): FunctionComponentElement<ErrorDialogProps> {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t("errorOccurred")}</DialogTitle>
      <DialogContent className="dialog-content">
        <pre style={{ whiteSpace: "pre-wrap" }}>{props.stacktrace}</pre>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
