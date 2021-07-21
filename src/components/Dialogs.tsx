import Dialog, { AlertDialog, ConfirmDialog } from "./Dialog";
import { Button, TextField } from "./inputs";
import { Typography } from "./layouts";
import { t } from "../renderer/global";
import { removeAccount } from "../struct/accounts";
import { removeProfile } from "../struct/profiles";
import { Component } from "react";
import { DefaultFunction } from "../tools/types";

export interface RequestPasswordDialogProps {
  again: boolean;
  callback: (password: string) => void;
  onClose: DefaultFunction;
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
