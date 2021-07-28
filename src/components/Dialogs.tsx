import Dialog, { AlertDialog, ConfirmDialog } from "./Dialog";
import { t } from "../renderer/global";
import { MinecraftAccount, removeAccount } from "../struct/accounts";
import { MinecraftProfile, removeProfile } from "../struct/profiles";
import { DefaultFunction } from "../tools/types";
import { Button, Link } from "./inputs";
import { Typography } from "./layouts";

export function RemoveAccountDialog(props: {
  account: MinecraftAccount;
  updateAccounts: DefaultFunction;
  onClose: DefaultFunction;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t.removeAccount}
      message={t.confirmRemoving}
      action={() => {
        removeAccount(props.account);
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
  profile: MinecraftProfile;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t.removeProfile}
      message={t.confirmRemoving}
      action={() => {
        removeProfile(props.profile);
        props.updateProfiles();
      }}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t.remove}
    />
  );
}

export function ErrorDialog(props: {
  stacktrace: string;
  onClose: DefaultFunction;
}): JSX.Element {
  return (
    <AlertDialog
      title={t.errorOccurred}
      message={props.stacktrace}
      close={props.onClose}
      pre
    />
  );
}

export function UpdateAvailableDialog(props: {
  version: string;
  onClose: DefaultFunction;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">
        {t.epheromeUpdate}
      </Typography>
      <Typography>{t.updateAvailable.replace("{}", props.version)}</Typography>
      <Typography>
        {t.pleaseGoToSiteToDownloadLatestVersion}:{" "}
        <Link type="url" href="https://epherome.com/download">
          https://epherome.com/download
        </Link>
      </Typography>
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={props.onClose}>
          {t.ok}
        </Button>
      </div>
    </Dialog>
  );
}
