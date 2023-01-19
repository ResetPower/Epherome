import { shift, useFloating } from "@floating-ui/react-dom";
import { IconButton } from "@resetpower/rcs";
import { notificationStore } from "common/stores/notification";
import { configStore } from "common/struct/config";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";
import {
  CSSProperties,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  MdClose,
  MdError,
  MdInfo,
  MdNotificationsActive,
  MdWarning,
} from "react-icons/md";
import JoinIn from "./JoinIn";

const NotificationPanelForwardRef = forwardRef(
  (
    props: { style?: CSSProperties; className?: string },
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      ref={ref}
      style={props.style}
      className={`bg-card text-contrast shadow-md z-20 rounded-md p-3 ${props.className}`}
    >
      <p className="mb-3 text-lg font-medium">{t("notifications")}</p>
      <JoinIn
        separator={<div className="border-t border-divider w-auto my-1" />}
      >
        {notificationStore.notifications.map(
          (n, i) =>
            notificationStore.read(n) && (
              <div className="flex items-center" key={i}>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    {n.type === "warn" ? (
                      <MdWarning className="text-yellow-500" />
                    ) : n.type === "error" ? (
                      <MdError className="text-red-500" />
                    ) : (
                      <MdInfo className="text-blue-500" />
                    )}
                    <p>{n.message}</p>
                  </div>
                  <div className="text-shallow text-sm">Source: {n.source}</div>
                </div>
                <MdClose
                  onClick={(e) => {
                    // prevent panel from closing
                    e.stopPropagation();
                    notificationStore.remove(n);
                  }}
                  className="eph-small-icon-btn"
                />
              </div>
            )
        )}
      </JoinIn>
      {notificationStore.notifications.length === 0 && (
        <div className="text-shallow text-sm">{t("noNotifications")}</div>
      )}
    </div>
  )
);

NotificationPanelForwardRef.displayName = "NotificationPanel";

const NotificationPanel = observer(NotificationPanelForwardRef);

const NotificationIcon = observer(
  (props: { setShow: (w: boolean) => unknown; show: boolean }) => (
    <IconButton
      className="flex"
      onClick={() => props.setShow(!props.show)}
      active={props.show}
    >
      <MdNotificationsActive />
      <span
        className={`absolute w-3 h-3 translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full text-xs text-white ${
          !notificationStore.withUnread &&
          configStore.allowNotificationDot &&
          "invisible"
        }`}
      />
    </IconButton>
  )
);

export function NotificationPanelShower(): JSX.Element {
  const { x, y, reference, floating, refs, strategy } =
    useFloating<HTMLElement>({
      placement: "bottom",
      middleware: [shift()],
    });
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
        <NotificationIcon setShow={setShow} show={show} />
      </div>
      {show && (
        <NotificationPanel
          className="z-20 right-1"
          ref={floating}
          style={{
            position: strategy,
            top: y ?? "",
            left: x ?? "",
          }}
        />
      )}
    </div>
  );
}
