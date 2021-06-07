import Button from "./Button";
import Icon from "./Icon";
import Typography from "./Typography";
import Dialog from "./Dialog";
import { PureComponent } from "react";
import { MinecraftLaunchDetail } from "../core/core";
import { t } from "../renderer/global";
import { CustomDialogProps } from "./Dialogs";

export interface LaunchProgressProps extends CustomDialogProps {
  details: MinecraftLaunchDetail[];
  helperText: string;
}

export default class LaunchProgress extends PureComponent<LaunchProgressProps> {
  render(): JSX.Element {
    return (
      <Dialog>
        <p className="text-lg px-3">{t("launching")}</p>
        <div className="px-3 h-60">
          {this.props.details.map((detail, index) => (
            <Typography key={index}>
              <Icon>{detail.stat ? "checked" : "arrow_forward"}</Icon>
              {detail.text}
            </Typography>
          ))}
        </div>
        <div className="flex justify-end px-3">
          <p className="flex-grow pl-4">{this.props.helperText}</p>
          <Button>{t("cancel")}</Button>
        </div>
      </Dialog>
    );
  }
}
