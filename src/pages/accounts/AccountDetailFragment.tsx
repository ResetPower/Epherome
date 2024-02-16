import { useState } from "react";
import Button from "../../components/Button";
import { MinecraftAccount } from "../../stores/struct";
import { Status, getDateTimeString } from "../../utils";
import { YggdrasilAuthenticator } from "../../core/auth/yggdrasil";
import Spinner from "../../components/Spinner";
import { MdCheckCircle } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { t } from "../../intl";
import Info from "../../components/Info";

export default function AccountDetailFragment(props: {
  current: MinecraftAccount;
  onRemove: () => unknown;
}) {
  const current = props.current;
  const [status, setStatus] = useState<Status>("unavailable");

  const checkStatus = () => {
    setStatus("loading");
    if (current.authserver && current.token) {
      new YggdrasilAuthenticator(current.authserver)
        .validate(current.token)
        .then((result) => setStatus(result ? "positive" : "negative")).catch;
    }
  };

  return (
    <div>
      <Info name={t.accounts.uuid}>{current.uuid}</Info>
      <Info name={t.accounts.type}>{t.accounts[current.type]}</Info>
      <Info name={t.username}>{current.name}</Info>
      {current.authserver && (
        <Info copyable={current.authserver} name={t.accounts.authserver}>
          {current.authserver}
        </Info>
      )}
      {current.time && (
        <Info name={t.createTime}>{getDateTimeString(current.time)}</Info>
      )}
      {current.type === "authlib" && (
        <div className="flex items-center my-3">
          {status === "loading" && <Spinner />}
          {status === "positive" && (
            <div className="flex items-center text-green-500">
              <MdCheckCircle /> {t.accounts.token.available}
            </div>
          )}
          {status === "negative" && (
            <div className="flex items-center text-red-500">
              <IoMdCloseCircle /> {t.accounts.token.unavailable}
            </div>
          )}
          <div className="flex-grow" />
          <Button onClick={checkStatus} primary>
            {t.accounts.token.validate}
          </Button>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={props.onRemove} dangerous>
          {t.remove}
        </Button>
      </div>
    </div>
  );
}
