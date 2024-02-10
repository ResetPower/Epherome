import { FormEventHandler, Fragment, useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import createOfflineAccount from "../../core/auth/offline";
import { YggdrasilAuthenticator } from "../../core/auth/yggdrasil";
import TabBar from "../../components/TabBar";
import { tr } from "../../internationalize";

export default function CreateAccountFragment(props: {
  goBack: () => unknown;
}) {
  const [type, setType] = useState(0);

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    if (type === 0) {
      const authenticator = new YggdrasilAuthenticator(
        data.get("authserver") as string
      );
      authenticator
        .createAccount(
          data.get("username") as string,
          data.get("password") as string
        )
        .then(props.goBack).catch;
    } else if (type === 1) {
      const name = data.get("name") as string;
      createOfflineAccount(name);
      props.goBack();
    }
  };

  return (
    <form
      className="flex flex-col h-full py-3 pl-3 pr-6 space-y-3"
      onSubmit={onSubmit}
    >
      <TabBar
        tabs={["Authlib Injector", "Offline"]}
        value={type}
        setValue={setType}
      />
      {type === 0 && (
        <Fragment>
          <Input label="Auth Server" name="authserver" required />
          <Input label="Email" name="username" required />
          <Input label="Password" type="password" name="password" required />
        </Fragment>
      )}
      {type === 1 && <Input largeLabel label="Username" name="name" required />}
      <div className="flex-grow" />
      <div className="flex my-3 space-x-3 justify-end">
        <Button onClick={props.goBack}>Cancel</Button>
        <Button type="submit" primary>
          {tr.account.action.create}
        </Button>
      </div>
    </form>
  );
}
