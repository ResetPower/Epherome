import { MdArrowDownward } from "react-icons/md";
import { t } from "../intl";
import { DefaultFn } from "../tools";

export default function ExtensionsView(props: {
  close: DefaultFn;
}): JSX.Element {
  return (
    <>
      <div className="flex-grow" />
      <div className="w-11/12 h-5/6 bg-card p-9 rounded-t-xl">
        <div className="flex p-3 border-b border-divider">
          <p className="font-semibold text-xl flex-grow">{t("extensions")}</p>
          <MdArrowDownward
            className="text-contrast cursor-pointer"
            onClick={props.close}
          />
        </div>
        <div className="p-3">
          <p>{t("notSupportedYet")}</p>
        </div>
      </div>
    </>
  );
}
