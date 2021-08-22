import { intlStore, t } from "../intl";
import { useOverlayCloser } from "../renderer/overlays";
import { BottomSheet, BottomSheetTitle } from "../components/sheets";
import {
  EphExtensionTranslations,
  extensionStore,
} from "common/stores/extension";
import { VscExtensions } from "react-icons/vsc";

function Square(props: { children: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center space-y-1 select-none">
      <div className="shadow-sm bg-background rounded-lg h-12 w-12 cursor-pointer flex items-center justify-center">
        <VscExtensions />
      </div>
      <p className="whitespace-pre-wrap text-sm text-center leading-3 pt-1">
        {props.children}
      </p>
    </div>
  );
}

export default function ExtensionsView(): JSX.Element {
  const exts = extensionStore.extensions;
  const close = useOverlayCloser();

  return (
    <BottomSheet>
      <div
        className="w-11/12 bg-card rounded-t-xl overflow-y-auto"
        style={{ height: "calc(100vh * 0.833333)" }}
      >
        <BottomSheetTitle close={close}>{t("extensions")}</BottomSheetTitle>
        <div className="grid grid-cols-5 px-9 py-3">
          {exts.length === 0 && <p>{t("profile.noContent")}</p>}
          {exts.map((ext) => {
            const translations = ext.meta.translations;
            return (
              <Square key={ext.id}>
                {translations[
                  intlStore.language?.name as EphExtensionTranslations
                ] ?? translations.default}
              </Square>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
