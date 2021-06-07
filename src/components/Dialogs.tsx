import Dialog from "./Dialog";
import Select from "./Select";
import SelectItem from "./SelectItem";
import Button from "./Button";
import Icon from "./Icon";
import TextField from "./TextField";
import Alert from "./Alert";
import { Component, ChangeEvent } from "react";
import { t } from "../renderer/global";
import { createAccount, removeAccount } from "../renderer/accounts";
import { createProfile, editProfile, MinecraftProfile, removeProfile } from "../renderer/profiles";
import { getById } from "../tools/arrays";
import { ipcRenderer } from "electron";
import { ephConfigs } from "../renderer/config";

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

export interface CreateAccountDialogState {
  isLoading: boolean;
  errorAlert: boolean;
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
    value: "mojang",
    username: "",
    password: "",
    authserver: "",
  };
  handleChange = (ev: ChangeEvent<{ value: unknown }>) => {
    this.setState({ value: ev.target.value as string });
  };
  handleClose = () => {
    this.setState({
      errorAlert: false,
    });
    this.props.onClose();
  };
  handleCreate = () => {
    this.setState({
      isLoading: true,
      errorAlert: false,
    });
    createAccount(
      this.state.value,
      this.state.username,
      this.state.password,
      this.state.authserver
    ).then((value: boolean) => {
      this.setState({
        isLoading: false,
      });
      if (value) {
        this.handleClose();
        this.props.updateAccounts();
      } else {
        this.setState({
          errorAlert: false,
        });
      }
    });
  };
  render() {
    return (
      <Dialog>
        <p className="text-lg">{t("newAccount")}</p>
        <div>
          {this.state.errorAlert && (
            <div>
              <Alert severity="warn">{t("errCreatingAccount")}</Alert>
              <br />
            </div>
          )}
          <Select value={this.state.value} onChange={this.handleChange}>
            <SelectItem value={"mojang"}>{t("mojang")}</SelectItem>
            <SelectItem value={"microsoft"}>{t("microsoft")}</SelectItem>
            <SelectItem value={"authlib"}>{t("authlib")}</SelectItem>
            <SelectItem value={"offline"}>{t("offline")}</SelectItem>
          </Select>
          <br />
          <br />
          <div hidden={this.state.value !== "mojang"}>
            <TextField
              label={t("email")}
              onChange={(ev: any) => this.setState({ username: ev.target.value })}
            />
            <TextField
              label={t("password")}
              onChange={(ev: any) => this.setState({ password: ev.target.value })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "microsoft"}>{t("clickToLogin")}</div>
          <div hidden={this.state.value !== "authlib"}>
            <TextField
              label={t("authserver")}
              onChange={(ev: any) => this.setState({ authserver: ev.target.value })}
            />
            <TextField
              label={t("email")}
              onChange={(ev: any) => this.setState({ username: ev.target.value })}
            />
            <TextField
              label={t("password")}
              onChange={(ev: any) => this.setState({ password: ev.target.value })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "offline"}>
            <TextField
              label={t("username")}
              onChange={(ev: any) => this.setState({ username: ev.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={this.handleClose}>{t("cancel")}</Button>
          <Button disabled={this.state.isLoading} onClick={this.handleCreate}>
            {t("create")}
          </Button>
        </div>
      </Dialog>
    );
  }
}

export function RemoveAccountDialog(props: RemoveAccountDialogProps): JSX.Element {
  const handleRemove = () => {
    removeAccount(props.id);
    props.onClose();
    props.updateAccounts();
  };
  return (
    <Dialog>
      <p className="text-lg">{t("removeAccount")}</p>
      <div>{t("confirmRemoving")}</div>
      <div className="flex justify-end">
        <Button onClick={props.onClose}>{t("cancel")}</Button>
        <Button onClick={handleRemove}>{t("remove")}</Button>
      </div>
    </Dialog>
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
  handleCreate = () => {
    const rs = createProfile(this.state.name, this.state.dir, this.state.ver);
    if (rs) {
      this.props.onClose();
      this.props.updateProfiles();
    }
  };
  handleOpenDirectory = () => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => {
      this.setState({ dir: arg });
    });
    ipcRenderer.send("openDirectory");
  };
  render() {
    return (
      <Dialog>
        <p className="text-lg">{t("newProfile")}</p>
        <div>
          <TextField
            label={t("name")}
            value={this.state.name}
            onChange={(ev: any) => this.setState({ name: ev.target.value })}
          />
          <TextField
            label={t("directory")}
            value={this.state.dir}
            onChange={(ev: any) => this.setState({ dir: ev.target.value })}
            helperText={t("usuallyDotMinecraftEtc")}
          />
          <TextField
            label={t("version")}
            value={this.state.ver}
            onChange={(ev: any) => this.setState({ ver: ev.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={this.handleOpenDirectory}>
            <Icon>folder</Icon> {t("openDirectory")}
          </Button>
          <div className="flex-grow"></div>
          <Button onClick={this.props.onClose}>{t("cancel")}</Button>
          <Button onClick={this.handleCreate}>{t("create")}</Button>
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
  state = {
    name: "",
    dir: "",
    ver: "",
  };
  componentDidUpdate(
    prevProps: Readonly<EditProfileDialogProps>,
    prevState: Readonly<EditProfileDialogState>,
    snapshot?: any
  ) {
    if (this.props.open && !prevProps.open) {
      const old = getById<MinecraftProfile>(ephConfigs.profiles, this.props.id) ?? {
        id: -1,
        name: "",
        dir: "",
        ver: "",
      };
      this.setState({
        name: old.name,
        dir: old.dir,
        ver: old.ver,
      });
    }
  }
  handleEdit = () => {
    editProfile(this.props.id, this.state.name, this.state.dir, this.state.ver);
    this.props.updateProfiles();
    this.props.onClose();
  };
  render() {
    return (
      <Dialog>
        <p className="text-lg">{t("editProfile")}</p>
        <div>
          <TextField
            label={t("name")}
            value={this.state.name}
            onChange={(e: any) => this.setState({ name: e.target.value })}
          />
          <TextField
            label={t("directory")}
            value={this.state.dir}
            onChange={(e: any) => this.setState({ dir: e.target.value })}
            helperText={t("usuallyDotMinecraftEtc")}
          />
          <TextField
            label={t("version")}
            value={this.state.ver}
            onChange={(e: any) => this.setState({ ver: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={this.props.onClose}>{t("cancel")}</Button>
          <Button onClick={this.handleEdit}>{t("edit")}</Button>
        </div>
      </Dialog>
    );
  }
}

export function RemoveProfileDialog(props: RemoveProfileDialogProps): JSX.Element {
  const handleRemove = () => {
    removeProfile(props.id);
    props.onClose();
    props.updateProfiles();
  };
  return (
    <Dialog>
      <p className="text-lg">{t("removeProfile")}</p>
      <div>{t("confirmRemoving")}</div>
      <div className="flex justify-end">
        <Button onClick={props.onClose}>{t("cancel")}</Button>
        <Button onClick={handleRemove}>{t("remove")}</Button>
      </div>
    </Dialog>
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
  handler = () => {
    this.props.onClose();
    this.props.callback(this.state.password);
  };
  render() {
    return (
      <Dialog>
        <p className="text-lg">{t("pleaseInputPassword")}</p>
        <div>
          <TextField
            value={this.state.password}
            onChange={(ev: any) => this.setState({ password: ev.target.value })}
            label={t("password")}
            type="password"
            helperText={this.props.again ? t("passwordWrong") : ""}
            error={this.props.again}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={this.props.onClose}>{t("cancel")}</Button>
          <Button onClick={this.handler}>{t("ok")}</Button>
        </div>
      </Dialog>
    );
  }
}

export function ErrorDialog(props: ErrorDialogProps): JSX.Element {
  return (
    <Dialog>
      <p className="text-lg">{t("errorOccurred")}</p>
      <div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{props.stacktrace}</pre>
      </div>
      <div className="flex justify-end">
        <Button onClick={props.onClose}>{t("ok")}</Button>
      </div>
    </Dialog>
  );
}
