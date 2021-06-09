import Button from "./Button";
import Icon from "./Icon";
import Dialog from "./Dialog";
import { Component, Fragment } from "react";
import { launchMinecraft, MinecraftLaunchDetail } from "../core/core";
import { t } from "../renderer/global";
import { CustomDialogProps, ErrorDialog, RequestPasswordDialog } from "./Dialogs";
import { showDialog } from "../renderer/overlay";
import { ephConfigs } from "../renderer/config";
import { broadcast, subscribeAsync } from "../renderer/session";
import { MinecraftAccount } from "../renderer/accounts";
import { MinecraftProfile } from "../renderer/profiles";
import Typography from "./Typography";

export interface LaunchProgressProps extends CustomDialogProps {
  account: MinecraftAccount;
  profile: MinecraftProfile;
}

export interface LaunchProgressState {
  helperText: string;
  details: MinecraftLaunchDetail[];
  againRequestPassword: boolean;
}

export default class LaunchProgress extends Component<LaunchProgressProps, LaunchProgressState> {
  state: LaunchProgressState = {
    details: [
      {
        stat: true,
        text: "progress.auth",
      },
      {
        stat: true,
        text: "progress.downloading",
      },
    ],
    helperText: "Launching...",
    againRequestPassword: false,
  };
  initialized = false;
  // handle password response (from (RequestPasswordDialog))
  handlePassword = (password: string): void => {
    broadcast("password", password);
  };
  componentDidMount(): void {
    // prevent mount too much
    if (this.initialized) {
      return;
    } else this.initialized = true;

    const onErr = (err: Error) => {
      this.props.onClose();
      showDialog((close) => <ErrorDialog onClose={close} stacktrace={err.stack ?? " "} />);
    };
    launchMinecraft({
      account: this.props.account,
      profile: this.props.profile,
      setDetails: (det) => this.setState({ details: det }),
      setHelper: (hel) => this.setState({ helperText: hel }),
      java: ephConfigs.javaPath,
      onDone: this.props.onClose,
      requestPassword: async (again: boolean) => {
        if (again !== this.state.againRequestPassword) {
          this.setState({
            againRequestPassword: again,
          });
        }
        showDialog((close) => (
          <RequestPasswordDialog
            onClose={close}
            again={this.state.againRequestPassword}
            callback={this.handlePassword}
          />
        ));
        return await subscribeAsync("password");
      },
      onErr,
    }).catch(onErr);
  }
  render(): JSX.Element {
    return (
      <Dialog>
        <Typography className="text-lg px-3">{t("launching")}</Typography>
        <div className="p-6 h-60">
          {this.state.details.map((detail, index) => (
            <div className="flex" key={index}>
              <i className="material-icons">{detail.stat ? "done" : "arrow_forward"}</i>
              <Typography>{t(detail.text)}</Typography>
            </div>
          ))}
        </div>
        <div className="flex justify-end px-3">
          <Typography className="flex-grow pl-4">{this.state.helperText}</Typography>
          <Button>{t("cancel")}</Button>
        </div>
      </Dialog>
    );
  }
}
