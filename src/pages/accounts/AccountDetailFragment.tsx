import { useState } from "react";
import Button from "../../components/Button";
import { MinecraftAccount } from "../../stores/struct";
import { Status } from "../../utils";
import { YggdrasilAuthenticator } from "../../core/auth/yggdrasil";
import Spinner from "../../components/Spinner";
import { MdCheckCircle } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";

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
        .then((result) => setStatus(result ? "positive" : "negative"));
    }
  };

  return (
    <div>
      <p>UUID: {current.uuid}</p>
      <p>Type: {current.type}</p>
      <p>Name: {current.name}</p>
      {current.authserver && <p>Authserver: {current.authserver}</p>}
      {current.type === "authlib" && (
        <div className="flex items-center my-3">
          <Button onClick={checkStatus} primary>
            Check Token Status
          </Button>
          <div className="flex-grow" />
          {status === "loading" && <Spinner />}
          {status === "positive" && (
            <div className="flex items-center text-green-500">
              <MdCheckCircle /> Token is available
            </div>
          )}
          {status === "negative" && (
            <div className="flex items-center text-red-500">
              <IoMdCloseCircle /> Token is unavailable
            </div>
          )}
        </div>
      )}
      <div className="flex">
        <Button onClick={props.onRemove} dangerous>
          Remove
        </Button>
      </div>
    </div>
  );
}
