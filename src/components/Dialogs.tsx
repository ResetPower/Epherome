import Dialog from "./Dialog";
import Select from "./Select";
import SelectItem from "./SelectItem";
import Button from "./Button";
import Icon from "./Icon";
import TextField from "./TextField";
import Alert from "./Alert";
import { Component, ChangeEvent } from "react";
import { t } from "../renderer/global";
import { createAccount, CreateAccountImplResult, removeAccount } from "../renderer/accounts";
import { createProfile, editProfile, getProfile, removeProfile } from "../renderer/profiles";
import { ipcRenderer } from "electron";
import Typography from "./Typography";
import Spin from "./Spin";

export interface CustomDialogProps {
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
  handleChange = (ev: ChangeEvent<{ value: unknown }>): void => {
    this.setState({ value: ev.target.value as string });
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
        <Typography className="text-xl">{t("newAccount")}</Typography>
        <div>
          {this.state.errorAlert && (
            <div className="my-3">
              <Alert severity="warn">{t("errCreatingAccount")}</Alert>
            </div>
          )}
          {this.state.msAccNoMinecraftAlert && (
            <div className="my-3">
              <Alert severity="warn">{t("msAccNoMinecraft")}</Alert>
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
            <TextField label={t("email")} onChange={(ev) => this.setState({ username: ev })} />
            <TextField
              label={t("password")}
              onChange={(ev) => this.setState({ password: ev })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "microsoft"}>
            <Typography>{t("clickToLogin")}</Typography>
          </div>
          <div hidden={this.state.value !== "authlib"}>
            <TextField
              label={t("authserver")}
              onChange={(ev) => this.setState({ authserver: ev })}
            />
            <TextField label={t("email")} onChange={(ev) => this.setState({ username: ev })} />
            <TextField
              label={t("password")}
              onChange={(ev) => this.setState({ password: ev })}
              type="password"
            />
          </div>
          <div hidden={this.state.value !== "offline"}>
            <TextField label={t("username")} onChange={(ev) => this.setState({ username: ev })} />
          </div>
        </div>
        <div className="flex">
          <div className="flex-grow">{this.state.isLoading && <Spin />}</div>
          <Button className="text-shallow" onClick={this.handleClose} textInherit>
            {t("cancel")}
          </Button>
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
    <Dialog indentBottom>
      <Typography className="text-xl">{t("removeAccount")}</Typography>
      <Typography>{t("confirmRemoving")}</Typography>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.onClose} textInherit>
          {t("cancel")}
        </Button>
        <Button className="text-red-500" onClick={handleRemove} textInherit>
          {t("remove")}
        </Button>
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
        <Typography className="text-xl">{t("newProfile")}</Typography>
        <div>
          <TextField
            label={t("name")}
            value={this.state.name}
            onChange={(ev) => this.setState({ name: ev })}
          />
          <TextField
            label={t("directory")}
            value={this.state.dir}
            onChange={(ev) => this.setState({ dir: ev })}
            helperText={t("usuallyDotMinecraftEtc")}
          />
          <TextField
            label={t("version")}
            value={this.state.ver}
            onChange={(ev) => this.setState({ ver: ev })}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={this.handleOpenDirectory}>
            <Icon>folder</Icon> {t("openDirectory")}
          </Button>
          <div className="flex-grow"></div>
          <Button className="text-shallow" onClick={this.props.onClose}>
            {t("cancel")}
          </Button>
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
  handleEdit = (): void => {
    editProfile(this.props.id, this.state.name, this.state.dir, this.state.ver);
    this.props.updateProfiles();
    this.props.onClose();
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl">{t("editProfile")}</Typography>
        <div>
          <TextField
            label={t("name")}
            value={this.state.name}
            onChange={(ev) => this.setState({ name: ev })}
          />
          <TextField
            label={t("directory")}
            value={this.state.dir}
            onChange={(ev) => this.setState({ dir: ev })}
            helperText={t("usuallyDotMinecraftEtc")}
          />
          <TextField
            label={t("version")}
            value={this.state.ver}
            onChange={(ev) => this.setState({ ver: ev })}
          />
        </div>
        <div className="flex justify-end">
          <Button className="text-shallow" onClick={this.props.onClose} textInherit>
            {t("cancel")}
          </Button>
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
    <Dialog indentBottom>
      <Typography className="text-xl">{t("removeProfile")}</Typography>
      <Typography>{t("confirmRemoving")}</Typography>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.onClose} textInherit>
          {t("cancel")}
        </Button>
        <Button className="text-red-500" onClick={handleRemove} textInherit>
          {t("remove")}
        </Button>
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
  handler = (): void => {
    this.props.onClose();
    this.props.callback(this.state.password);
  };
  render(): JSX.Element {
    return (
      <Dialog indentBottom>
        <Typography className="text-xl">{t("pleaseInputPassword")}</Typography>
        <div>
          <TextField
            value={this.state.password}
            onChange={(ev) => this.setState({ password: ev })}
            label={t("password")}
            type="password"
            helperText={this.props.again ? t("passwordWrong") : ""}
            error={this.props.again}
          />
        </div>
        <div className="flex justify-end">
          <Button className="text-shallow" onClick={this.props.onClose} textInherit>
            {t("cancel")}
          </Button>
          <Button onClick={this.handler}>{t("ok")}</Button>
        </div>
      </Dialog>
    );
  }
}

export function ErrorDialog(props: ErrorDialogProps): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl">{t("errorOccurred")}</Typography>
      <div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{props.stacktrace}</pre>
      </div>
      <div className="flex justify-end">
        <Button onClick={props.onClose}>{t("ok")}</Button>
      </div>
    </Dialog>
  );
}
