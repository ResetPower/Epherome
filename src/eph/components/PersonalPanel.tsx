import { shift, useFloating } from "@floating-ui/react-dom";
import { Button, IconButton, Tooltip } from "@resetpower/rcs";
import { configStore } from "common/struct/config";
import { DefaultFn } from "common/utils";
import { historyStore } from "eph/renderer/history";
import { observer } from "mobx-react-lite";
import {
  CSSProperties,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import VerifiedBadge from "./VerifiedBadge";
import { BsFillXDiamondFill } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import {
  EphUserInfo,
  parseEphToken,
  personalStore,
} from "common/stores/personal";
import { t } from "eph/intl";

const PersonalHead = observer((props: { lg?: boolean }) => {
  if (personalStore.userInfo === null) {
    return <VscAccount />;
  }
  const dh = personalStore.getDefaultHead();

  return (
    <img
      className={`${props.lg ? "w-14 h-14" : "w-8 h-8"} rounded-full`}
      src={personalStore.head ?? dh}
      onError={(ev) => (ev.currentTarget.src = dh)}
    />
  );
});

export function PersonalTile(props: { bottomPop?: boolean }): JSX.Element {
  const userInfo = personalStore.userInfo;

  return userInfo ? (
    <div className="p-3">
      <PersonalHead lg />
      <div className="flex items-center space-x-1">
        <p className="font-semibold text-lg">{userInfo.name}</p>
        {userInfo.verified && <VerifiedBadge />}
        {userInfo.plan === "ultimate" &&
          (props.bottomPop ? (
            <BsFillXDiamondFill color="#0abab5" />
          ) : (
            <Tooltip text="Epherome Ultimate Plan Subscriber">
              <BsFillXDiamondFill color="#0abab5" />
            </Tooltip>
          ))}
      </div>
      <p className="text-sm text-shallow">ID: {userInfo.id}</p>
    </div>
  ) : (
    <p>NOT LOGGED IN</p>
  );
}

const PersonalPanelForwardRef = forwardRef(
  (
    props: {
      style: CSSProperties;
      className?: string;
      onClose: DefaultFn;
      userInfo: EphUserInfo | null;
    },
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      ref={ref}
      style={props.style}
      className={`bg-card text-contrast border border-divider shadow-md rounded-md p-3 ${props.className}`}
    >
      {props.userInfo ? (
        <>
          <PersonalTile />
          <Button
            onClick={() => {
              historyStore.push("ephPersonalCenter");
              props.onClose();
            }}
            className="justify-center w-full"
          >
            {t("personal.openPersonalCenter")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-center py-3">{t("personal.notLoggedIn")}</p>
          <Button
            onClick={() => {
              historyStore.push("ephLogin");
              props.onClose();
            }}
            className="justify-center w-full"
          >
            {t("personal.loginTo")}
          </Button>
        </>
      )}
    </div>
  )
);

PersonalPanelForwardRef.displayName = "PersonalPanel";

const PersonalPanel = observer(PersonalPanelForwardRef);

PersonalPanel.displayName = "PersonalPanel";

export const PersonalPanelShower = observer(() => {
  const token = configStore.epheromeToken;
  const { x, y, reference, floating, refs, strategy } =
    useFloating<HTMLElement>({
      placement: "bottom",
      middleware: [shift()],
    });
  const userInfo = useMemo(() => parseEphToken(token), [token]);
  const [show, setShow] = useState(false);
  const close = useCallback(
    (event: Event) => {
      if (
        !refs.reference.current?.contains(event.target as Node) &&
        !refs.floating.current?.contains(event.target as Node)
      ) {
        setShow(false);
      }
    },
    [refs]
  );

  useEffect(
    () =>
      (show ? document.addEventListener : document.removeEventListener)(
        "click",
        close
      ),
    [show, close]
  );

  return (
    <div>
      <div ref={reference}>
        <IconButton
          className="flex"
          onClick={() => setShow(!show)}
          active={show}
        >
          <PersonalHead />
        </IconButton>
      </div>
      {show && (
        <PersonalPanel
          userInfo={userInfo}
          className="z-20 right-1"
          ref={floating}
          onClose={() => setShow(false)}
          style={{
            position: strategy,
            top: y ?? "",
            left: x ?? "",
          }}
        />
      )}
    </div>
  );
});
