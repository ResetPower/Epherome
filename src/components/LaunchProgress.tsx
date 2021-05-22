import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  Typography,
} from "@material-ui/core";
import { PureComponent } from "react";
import { MinecraftLaunchDetail } from "../core/core";
import { t } from "../renderer/global";
import { CustomDialogProps } from "./Dialogs";
import "../styles/launch_progress.css";

export interface LaunchProgressProps extends CustomDialogProps {
  details: MinecraftLaunchDetail[];
  helperText: string;
}

export default class LaunchProgress extends PureComponent<LaunchProgressProps> {
  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose}>
        <DialogTitle>{t("launching")}</DialogTitle>
        <DialogContent className="launch-content">
          {this.props.details.map((detail, index) => (
            <Typography key={index}>
              <Icon>{detail.stat ? "checked" : "arrow_forward"}</Icon>
              {detail.text}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Typography className="launch-helper">{this.props.helperText}</Typography>
          <Button color="secondary">{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
