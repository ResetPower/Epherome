import { FormEventHandler, useRef, useState } from "react";
import Button from "../components/Button";
import { t } from "../intl";
import Shallow from "../components/Shallow";
import Input from "../components/Input";
import { ToastType, toastStore } from "../stores/toast";
import Select from "../components/Select";
import Info from "../components/Info";
import { resolve } from "../utils";
import { dialogStore } from "../stores/dialog";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  const [toastType, setToastType] = useState<ToastType>("success");
  const toastMsg = useRef<HTMLInputElement>(null);
  const sendToastMsg = () =>
    toastStore.show({
      out: false,
      message: toastMsg.current?.value ?? "",
      type: toastType,
    });
  const openDialog: FormEventHandler = (e) => {
    e.preventDefault();
    dialogStore.show(resolve(new FormData(e.target as HTMLFormElement)));
  };

  return (
    <div className="space-y-9">
      <div>
        <Shallow>Counter</Shallow>
        <p>{t.counter.clicked(count)}</p>
        <Button onClick={() => setCount(count + 1)} primary>
          {t.counter.increase}
        </Button>
      </div>
      <div>
        <Shallow>Toast</Shallow>
        <Info name="Toast Type">
          <Select
            value={toastType}
            onChange={(newValue) => setToastType(newValue as ToastType)}
            options={{ success: "Success", fail: "Fail" }}
          />
        </Info>
        <Input
          label="Message"
          defaultValue="Message"
          ref={toastMsg}
          trailing={<Button onClick={sendToastMsg}>Send</Button>}
        />
      </div>
      <div>
        <Shallow>Dialog</Shallow>
        <form onSubmit={openDialog} className="flex space-x-3 items-center">
          <Input label="Title" name="title" defaultValue="Title" />
          <Input label="Message" name="message" defaultValue="Message" />
          <Button type="submit" className="mt-2">
            Open
          </Button>
        </form>
      </div>
    </div>
  );
}
