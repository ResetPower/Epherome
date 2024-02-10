import { useState } from "react";
import Button from "../../components/Button";
import { MinecraftAccount } from "../../stores/struct";
import { Status } from "../../utils";
import { YggdrasilAuthenticator } from "../../core/auth/yggdrasil";
import Spinner from "../../components/Spinner";
import { MdCheckCircle } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { t } from "../../intl";

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
      <p>UUID: {current.uuid}</p>
      <p>
        {t.accounts.type}: {t.accounts[current.type]}
      </p>
      <p>
        {t.username}: {current.name}
      </p>
      {current.authserver && (
        <p>
          {t.accounts.authserver}: {current.authserver}
        </p>
      )}
      {current.type === "authlib" && (
        <div className="flex items-center my-3">
          <Button onClick={checkStatus} primary>
            {t.accounts.token.validate}
          </Button>
          <div className="flex-grow" />
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
        </div>
      )}
      <div className="flex">
        <Button onClick={props.onRemove} dangerous>
          {t.remove}
        </Button>
      </div>
    </div>
  );
}
