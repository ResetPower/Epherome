import { FormControl, Grid, Icon, InputLabel, MenuItem, Select } from "@material-ui/core";
import {
  Container,
  Button,
  Typography,
  Card,
  CardActions,
  CardContent,
  makeStyles,
} from "@material-ui/core";
import React, { FunctionComponentElement, useState } from "react";
import { hist } from "../renderer/global";
import { readConfig, writeConfig } from "../renderer/config";
import { getById } from "../tools/arrays";
import { MinecraftAccount } from "../renderer/accounts";
import { useBooleanState, useConfigState } from "../renderer/hooks";
import { MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import LaunchProgress from "../components/LaunchProgress";
import { launchMinecraft, MinecraftLaunchDetail } from "../core/core";

const useStyle = makeStyles({
  card: {
    padding: "10px",
    marginBottom: "10px",
  },
  space: {
    flexGrow: 1,
  },
  select: {
    width: "100%",
    marginTop: "10px",
    marginBottom: "10px",
  },
});

export default function HomePage(): FunctionComponentElement<EmptyProps> {
  const classes = useStyle();
  const [minecraftDialog, openMinecraftDialog, closeMinecraftDialog] = useBooleanState(false);
  const [profiles] = useConfigState("profiles", []);
  const selectedProfile = readConfig("selectedProfile", -1);
  const [details, setDetails] = useState<MinecraftLaunchDetail[]>([]);
  const [helperText, setHelperText] = useState("...");
  const [value, setValue] = useState<unknown>(
    getById(profiles, selectedProfile) === null ? "" : selectedProfile
  );
  const accountId = readConfig("selectedAccount", 0);
  const account = getById<MinecraftAccount>(readConfig("accounts", []), accountId);
  const username = account?.name;
  // handle minecraft profile select
  const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
    writeConfig("selectedProfile", ev.target.value as number);
    setValue(ev.target.value as number);
  };
  const handleLaunch = () => {
    if (typeof value === "number") {
      const profile = profiles[value];
      if (account !== null && profile !== null) {
        openMinecraftDialog();
        launchMinecraft({
          account,
          profile,
          setDetails,
          setHelper: setHelperText,
          java: "java",
          onDone: closeMinecraftDialog,
        });
      }
    }
  };

  return (
    <Container className="eph-page">
      <Card className={classes.card}>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            {t("hello")}
          </Typography>
          <Typography variant="h5">{username === undefined ? "Tourist" : username}</Typography>
          <Typography>海内存知己，天涯若比邻。</Typography>
        </CardContent>
        <CardActions>
          <Button onClick={() => hist.push("/accounts")}>
            <Icon>account_circle</Icon> {t("accounts")}
          </Button>
          <Button onClick={() => hist.push("/profiles")}>
            <Icon>gamepad</Icon> {t("profiles")}
          </Button>
          <div className={classes.space}></div>
          <Button variant="outlined" onClick={() => hist.push("/settings")}>
            <Icon>settings</Icon> {t("settings")}
          </Button>
        </CardActions>
      </Card>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card className={classes.card} variant="outlined">
            <FormControl variant="standard" className={classes.select}>
              <InputLabel>Minecraft</InputLabel>
              <Select value={value} onChange={handleChange}>
                {profiles.map((i: MinecraftProfile) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" size="large" color="secondary" onClick={handleLaunch}>
              {t("launch")}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className={classes.card} variant="outlined">
            <Typography>News</Typography>
            <p>No news yet.</p>
          </Card>
        </Grid>
      </Grid>
      <LaunchProgress
        open={minecraftDialog}
        onClose={closeMinecraftDialog}
        details={details}
        helperText={helperText}
      />
    </Container>
  );
}
