import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React from "react";
import { MinecraftLaunchDetail } from "../core/core";
import { t } from "../renderer/global";
import { CustomDialogProps } from "./Dialogs";

export interface LaunchProgressProps extends CustomDialogProps {
  details: MinecraftLaunchDetail[];
  helperText: string;
}

const useStyle = makeStyles({
  helperText: {
    flexGrow: 1,
    paddingLeft: 10,
  },
  content: {
    minWidth: 600,
    height: 250,
  },
});

export default function LaunchProgress(
  props: LaunchProgressProps
): React.FunctionComponentElement<LaunchProgressProps> {
  const classes = useStyle();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t("launching")}</DialogTitle>
      <DialogContent className={classes.content}>
        {props.details.map((detail, index) => (
          <Typography key={index}>
            <Icon>{detail.stat ? "checked" : "arrow_forward"}</Icon>
            {detail.text}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Typography className={classes.helperText}>{props.helperText}</Typography>
        <Button color="secondary">{t("cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}
