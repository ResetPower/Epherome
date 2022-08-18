import { FloatingView, Hyperlink, IconButton } from "@resetpower/rcs";
import { DefaultFn } from "common/utils";
import { historyStore } from "eph/renderer/history";
import { observer } from "mobx-react-lite";
import VerifiedBadge from "./VerifiedBadge";
import { BsFillXDiamondFill } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import { EphUserInfo, personalStore } from "common/stores/personal";
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

export function PersonalTile(props: {
  bottomPop?: boolean;
  userInfo: EphUserInfo;
}): JSX.Element {
  const userInfo = props.userInfo;

  return (
    <div className="p-3">
      <PersonalHead lg />
      <div className="flex items-center space-x-1">
        <p className="font-medium text-lg">{userInfo.name}</p>
        {userInfo.verified && <VerifiedBadge />}
        {userInfo.plan === "ultimate" &&
          (props.bottomPop ? (
            <BsFillXDiamondFill color="#0abab5" />
          ) : (
            <BsFillXDiamondFill color="#0abab5" />
          ))}
      </div>
      <p className="text-sm text-shallow">ID: {userInfo.uuid}</p>
    </div>
  );
}

export function PersonalPanel(props: {
  onClose: DefaultFn;
  userInfo: EphUserInfo | null;
}) {
  return props.userInfo ? (
    <div>
      <PersonalTile userInfo={props.userInfo} />
      <Hyperlink
        button
        onClick={() => {
          historyStore.push("ephPersonalCenter");
          props.onClose();
        }}
        className="justify-center w-full"
      >
        {t("personal.openPersonalCenter")}
      </Hyperlink>
    </div>
  ) : (
    <div>
      <p className="text-center py-1">{t("personal.notLoggedIn")}</p>
      <Hyperlink
        button
        onClick={() => {
          historyStore.push("ephLogin");
          props.onClose();
        }}
        className="justify-center w-full"
      >
        {t("personal.loginTo")}
      </Hyperlink>
    </div>
  );
}

export const PersonalPanelShower = observer(() => {
  const userInfo = personalStore.userInfo;

  return (
    <FloatingView
      padding={3}
      className="p-3"
      opener={(open) => (
        <IconButton className="flex" active={open}>
          <PersonalHead />
        </IconButton>
      )}
    >
      {(_, setOpen) => (
        <PersonalPanel onClose={() => setOpen(false)} userInfo={userInfo} />
      )}
    </FloatingView>
  );
});
