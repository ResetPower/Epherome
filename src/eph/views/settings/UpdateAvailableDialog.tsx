import { Hyperlink } from "@resetpower/rcs";
import { openInBrowser } from "common/utils/open";
import { t } from "eph/intl";

export default function UpdateAvailableDialog(props: {
  version: string;
}): JSX.Element {
  const href = "https://epherome.com/downloads";

  return (
    <>
      <p>{t("epheromeUpdate.available", props.version)}</p>
      <p>{t("epheromeUpdate.availableMessage")}</p>
      <Hyperlink onClick={() => openInBrowser(href)}>{href}</Hyperlink>
    </>
  );
}
