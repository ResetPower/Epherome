import Dialog, { AlertDialog, ConfirmDialog } from "./Dialog";
import { MinecraftAccount, removeAccount } from "../struct/accounts";
import { MinecraftProfile, removeProfile } from "../struct/profiles";
import { DefaultFn } from "../tools/types";
import { Button, Link } from "./inputs";
import { Typography } from "./layouts";
import { t } from "../intl";

export function RemoveAccountDialog(props: {
  account: MinecraftAccount;
  updateAccounts: DefaultFn;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t("removeAccount")}
      message={t("confirmRemoving")}
      action={() => {
        removeAccount(props.account);
        props.updateAccounts();
      }}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t("remove")}
    />
  );
}

export function RemoveProfileDialog(props: {
  updateProfiles: DefaultFn;
  onClose: DefaultFn;
  profile: MinecraftProfile;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t("removeProfile")}
      message={t("confirmRemoving")}
      action={() => {
        removeProfile(props.profile);
        props.updateProfiles();
      }}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t("remove")}
    />
  );
}

export function ErrorDialog(props: {
  stacktrace: string;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <AlertDialog
      title={t("errorOccurred")}
      message={props.stacktrace}
      close={props.onClose}
      pre
    />
  );
}

export function UpdateAvailableDialog(props: {
  version: string;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">
        {t("epheromeUpdate")}
      </Typography>
      <Typography>{t("updateAvailable", props.version)}</Typography>
      <Typography>
        {t("pleaseGoToSiteToDownloadLatestVersion")}:{" "}
        <Link type="url" href="https://epherome.com/download">
          https://epherome.com/download
        </Link>
      </Typography>
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={props.onClose}>
          {t("ok")}
        </Button>
      </div>
    </Dialog>
  );
}
