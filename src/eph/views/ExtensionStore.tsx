import { Center } from "@resetpower/rcs";
import { t } from "eph/intl";

export default function ExtensionStore(): JSX.Element {
  return (
    <div className="eph-h-full">
      <Center className="text-shallow">{t("notSupportedYet")}</Center>
    </div>
  );
}
