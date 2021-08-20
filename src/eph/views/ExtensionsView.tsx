import { t } from "../intl";
import { useOverlayCloser } from "../renderer/overlays";
import { BottomSheet, BottomSheetTitle } from "../components/sheets";

export default function ExtensionsView(): JSX.Element {
  const close = useOverlayCloser();

  return (
    <BottomSheet>
      <div
        className="w-11/12 bg-card rounded-t-xl overflow-y-auto"
        style={{ height: "calc(100vh * 0.833333)" }}
      >
        <BottomSheetTitle close={close}>{t("extensions")}</BottomSheetTitle>
        <div className="px-9">
          <p>{t("notSupportedYet")}</p>
        </div>
      </div>
    </BottomSheet>
  );
}
