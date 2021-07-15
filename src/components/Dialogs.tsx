import Dialog, { AlertDialog, ConfirmDialog } from "./Dialog";
import { Select, Button, TextField } from "./inputs";
import Alert from "./Alert";
import { t } from "../renderer/global";
import { createAccount, CreateAccountImplResult, removeAccount } from "../struct/accounts";
import { createProfile, editProfile, getProfile, removeProfile } from "../struct/profiles";
import { ipcRenderer } from "electron";
import Typography from "./Typography";
import Spin from "./Spin";
import { Component } from "react";
import { DefaultFunction } from "../tools/types";
import { MdFolder } from "react-icons/md";

export interface CreateAccountDialogProps {
  updateAccounts: DefaultFunction;
  onClose: DefaultFunction;
}

export interface CreateProfileDialogProps {
  updateProfiles: DefaultFunction;
  onClose: DefaultFunction;
}

export interface EditProfileDialogProps {
  updateProfiles: DefaultFunction;
  id: number;
  onClose: DefaultFunction;
}

export interface RequestPasswordDialogProps {
  again: boolean;
  callback: (password: string) => void;
  onClose: DefaultFunction;
}

export interface CreateAccountDialogState {
  isLoading: boolean;
  errorAlert: boolean;
  msAccNoMinecraftAlert: boolean;
  value: string;
  username: string;
  password: string;
  authserver: string;
}

export class CreateAccountDialog extends Component<
  CreateAccountDialogProps,
  CreateAccountDialogState
> {
  state: CreateAccountDialogState = {
    isLoading: false,
    errorAlert: false,
    msAccNoMinecraftAlert: false,
    value: "mojang",
    username: "",
    password: "",
    authserver: "",
  };
  handleChange = (ev: string): void => {
    this.setState({ value: ev });
  };
  handleClose = (): void => {
    this.setState({
      errorAlert: false,
    });
    this.props.onClose();
  };
  handleCreate = (): void => {
    this.setState({
      isLoading: true,
      errorAlert: false,
      msAccNoMinecraftAlert: false,
    });
    createAccount(
      this.state.value,
      this.state.username,
      this.state.password,
      this.state.authserver
    ).then((value: CreateAccountImplResult) => {
      this.setState({
        isLoading: false,
      });
      if (value.success) {
        this.handleClose();
        this.props.updateAccounts();
      } else {
        if (value.message === "msAccNoMinecraft") {
          this.setState({
            msAccNoMinecraftAlert: true,
          });
        } else {
          this.setState({
            errorAlert: true,
          });
        }
      }
    });
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl font-semibold">{t.newAccount}</Typography>
        <div>
          {this.state.errorAlert && (
            <div className="my-3">
              <Alert severity="warn">{t.errCreatingAccount}</Alert>
            </div>
          )}
          {this.state.msAccNoMinecraftAlert && (
            <div className="my-3">
              <Alert severity="warn">{t.msAccNoMinecraft}</Alert>
            </div>
          )}
          <Select value={this.state.value} onChange={this.handleChange}>
            <option value={"mojang"}>{t.mojang}</option>
            <option value={"microsoft"}>{t.microsoft}</option>
            <option value={"authlib"}>{t.authlib}</option>
            <option value={"offline"}>{t.offline}</option>
          </Select>
          <div hidden={this.state.value !== "mojang"}>
            <TextField label={t.email} onChange={(ev) => this.setState({ username: ev })} />
            <TextField
              label={t.password}
              onChange={(ev) => this.setState({ password: ev })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "microsoft"}>
            <Typography>{t.clickToLogin}</Typography>
          </div>
          <div hidden={this.state.value !== "authlib"}>
            <TextField label={t.authserver} onChange={(ev) => this.setState({ authserver: ev })} />
            <TextField label={t.email} onChange={(ev) => this.setState({ username: ev })} />
            <TextField
              label={t.password}
              onChange={(ev) => this.setState({ password: ev })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "offline"}>
            <TextField label={t.username} onChange={(ev) => this.setState({ username: ev })} />
          </div>
        </div>
        <div className="flex">
          <div className="flex-grow">{this.state.isLoading && <Spin />}</div>
          <Button className="text-shallow" onClick={this.handleClose} textInherit>
            {t.cancel}
          </Button>
          <Button disabled={this.state.isLoading} onClick={this.handleCreate}>
            {t.create}
          </Button>
        </div>
      </Dialog>
    );
  }
}

export function RemoveAccountDialog(props: {
  id: number;
  updateAccounts: DefaultFunction;
  onClose: DefaultFunction;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t.removeAccount}
      message={t.confirmRemoving}
      action={() => {
        removeAccount(props.id);
        props.updateAccounts();
      }}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t.remove}
    />
  );
}

export interface CreateProfileDialogState {
  name: string;
  dir: string;
  ver: string;
}

export class CreateProfileDialog extends Component<
  CreateProfileDialogProps,
  CreateProfileDialogState
> {
  state: CreateProfileDialogState = {
    name: "",
    dir: "",
    ver: "",
  };
  handleCreate = (): void => {
    const rs = createProfile(this.state.name, this.state.dir, this.state.ver);
    if (rs) {
      this.props.onClose();
      this.props.updateProfiles();
    }
  };
  handleOpenDirectory = (): void => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => {
      this.setState({ dir: arg });
    });
    ipcRenderer.send("openDirectory");
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl font-semibold">{t.newProfile}</Typography>
        <div>
          <TextField
            label={t.name}
            value={this.state.name}
            onChange={(ev) => this.setState({ name: ev })}
          />
          <TextField
            label={t.directory}
            value={this.state.dir}
            onChange={(ev) => this.setState({ dir: ev })}
            helperText={t.usuallyDotMinecraftEtc}
          />
          <TextField
            label={t.version}
            value={this.state.ver}
            onChange={(ev) => this.setState({ ver: ev })}
          />
        </div>
        <div className="flex">
          <Button onClick={this.handleOpenDirectory}>
            <MdFolder /> {t.openDirectory}
          </Button>
          <div className="flex-grow"></div>
          <Button className="text-shallow" onClick={this.props.onClose}>
            {t.cancel}
          </Button>
          <Button onClick={this.handleCreate}>{t.create}</Button>
        </div>
      </Dialog>
    );
  }
}

export interface EditProfileDialogState {
  name: string;
  dir: string;
  ver: string;
}

export class EditProfileDialog extends Component<EditProfileDialogProps, EditProfileDialogState> {
  state: EditProfileDialogState = {
    name: "",
    dir: "",
    ver: "",
  };
  constructor(props: EditProfileDialogProps) {
    super(props);
    const profile = getProfile(this.props.id);
    if (profile) {
      this.state = {
        name: profile.name,
        dir: profile.dir,
        ver: profile.ver,
      };
    }
  }
  handleOpenDirectory = (): void => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => {
      this.setState({ dir: arg });
    });
    ipcRenderer.send("openDirectory");
  };
  handleEdit = (): void => {
    editProfile(this.props.id, this.state.name, this.state.dir, this.state.ver);
    this.props.updateProfiles();
    this.props.onClose();
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl font-semibold">{t.editProfile}</Typography>
        <div>
          <TextField
            label={t.name}
            value={this.state.name}
            onChange={(ev) => this.setState({ name: ev })}
          />
          <TextField
            label={t.directory}
            value={this.state.dir}
            onChange={(ev) => this.setState({ dir: ev })}
            helperText={t.usuallyDotMinecraftEtc}
          />
          <TextField
            label={t.version}
            value={this.state.ver}
            onChange={(ev) => this.setState({ ver: ev })}
          />
        </div>
        <div className="flex">
          <Button onClick={this.handleOpenDirectory}>
            <MdFolder /> {t.openDirectory}
          </Button>
          <div className="flex-grow"></div>
          <Button className="text-shallow" onClick={this.props.onClose} textInherit>
            {t.cancel}
          </Button>
          <Button onClick={this.handleEdit}>{t.edit}</Button>
        </div>
      </Dialog>
    );
  }
}

export function RemoveProfileDialog(props: {
  updateProfiles: DefaultFunction;
  onClose: DefaultFunction;
  id: number;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t.removeProfile}
      message={t.confirmRemoving}
      action={() => {
        removeProfile(props.id);
        props.updateProfiles();
      }}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t.remove}
    />
  );
}

export interface RequestPasswordDialogState {
  password: string;
}

export class RequestPasswordDialog extends Component<
  RequestPasswordDialogProps,
  RequestPasswordDialogState
> {
  state: RequestPasswordDialogState = {
    password: "",
  };
  handler = (): void => {
    this.props.onClose();
    this.props.callback(this.state.password);
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl font-semibold">{t.pleaseInputPassword}</Typography>
        <div>
          <TextField
            value={this.state.password}
            onChange={(ev) => this.setState({ password: ev })}
            label={t.password}
            type="password"
            helperText={this.props.again ? t.passwordWrong : ""}
            error={this.props.again}
          />
        </div>
        <div className="flex justify-end">
          <Button className="text-shallow" onClick={this.props.onClose} textInherit>
            {t.cancel}
          </Button>
          <Button onClick={this.handler}>{t.ok}</Button>
        </div>
      </Dialog>
    );
  }
}

export function ErrorDialog(props: { stacktrace: string; onClose: DefaultFunction }): JSX.Element {
  return (
    <AlertDialog title={t.errorOccurred} message={props.stacktrace} close={props.onClose} pre />
  );
}

export function DownloadDialog(props: { onClose: DefaultFunction }): JSX.Element {
  return <AlertDialog title={t.warning} message={t.downloadNotSupported} close={props.onClose} />;
}
