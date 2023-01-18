import { configStore, FnBoardPlacement } from "common/struct/config";
import { KeyOfLanguageDefinition, t } from "eph/intl";
import { historyStore, Pathname } from "eph/renderer/history";
import { createContext, ReactNode, useContext } from "react";

const MetroCardContext = createContext(false);

export function MetroCard(props: {
  icon: ReactNode;
  target: Pathname;
  className: string;
}) {
  const enableBg = useContext(MetroCardContext);

  return (
    <div
      className={`${props.className} ${
        enableBg && "bg-opacity-50"
      } rounded text-white flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none p-3 space-x-3`}
      onClick={() => historyStore.push(props.target)}
      style={
        enableBg
          ? {
              backdropFilter: "blur(10px)",
            }
          : {}
      }
    >
      <div className="text-2xl">{props.icon}</div>
      {!enableBg && <div>{t(props.target as KeyOfLanguageDefinition)}</div>}
    </div>
  );
}

export function MetroCardProvider(props: {
  value: boolean;
  children: ReactNode;
  placement: FnBoardPlacement;
}): JSX.Element {
  return props.value ? (
    props.placement === "top" ? (
      <div className="p-6 flex justify-center space-x-2 slideInDown">
        <MetroCardContext.Provider value={configStore.enableBg}>
          {props.children}
        </MetroCardContext.Provider>
      </div>
    ) : props.placement === "right" ? (
      <div className="flex h-full justify-end">
        <div className="flex flex-col justify-center space-y-2 mr-3 slideInRight">
          <MetroCardContext.Provider value={configStore.enableBg}>
            {props.children}
          </MetroCardContext.Provider>
        </div>
      </div>
    ) : (
      <div></div>
    )
  ) : (
    <div className="grid grid-cols-2 gap-5 p-6">
      <MetroCardContext.Provider value={false}>
        {props.children}
      </MetroCardContext.Provider>
    </div>
  );
}
