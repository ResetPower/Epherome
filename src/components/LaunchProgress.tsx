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
  },
  content: {
    minWidth: "500px",
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
        {props.details.map((detail) => (
          <Typography>
            <Icon>{detail.stat ? "checked" : "arrow_forward"}</Icon>
            {detail.text}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Typography className={classes.helperText}>{props.helperText}</Typography>
        <Button color="secondary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
