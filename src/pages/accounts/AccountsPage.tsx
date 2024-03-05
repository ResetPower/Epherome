import { MdAdd } from "react-icons/md";
import { cfg } from "../../stores/config";
import { useState } from "react";
import CreateAccountFragment from "./CreateAccountFragment";
import ListTile from "../../components/ListTile";
import AccountDetailFragment from "./AccountDetailFragment";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { t } from "../../intl";
import { dialogStore } from "../../stores/dialog";

export default function AccountsPage() {
  const [state, setState] = useState(cfg.accounts.active);
  const current = state && state !== "create" && cfg.accounts.find(state);

  return (
    <div className="flex w-full">
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex-grow p-3 space-y-1">
          {cfg.accounts.isEmpty ? (
            <Center className="text-gray-500">{t.accounts.empty}</Center>
          ) : (
            cfg.accounts.map((acc, id) => (
              <ListTile
                onClick={() => {
                  cfg.accounts.select(id);
                  setState(id);
                }}
                active={cfg.accounts.selected(id) && state !== "create"}
                key={id}
              >
                {acc.name}
              </ListTile>
            ))
          )}
        </div>
        <WideButton className="border-t" onClick={() => setState("create")}>
          <MdAdd />
          {t.create}
        </WideButton>
      </div>
      <div className="flex-grow p-3">
        {!state && <Center>{t.accounts.unopened}</Center>}
        {state === "create" && (
          <CreateAccountFragment goBack={() => setState(cfg.accounts.active)} />
        )}
        {current && (
          <AccountDetailFragment
            onRemove={() =>
              dialogStore.show({
                title: "Confirmation",
                message: t.accounts.removeConfirmation(current.name),
                actionName: t.remove,
                dangerous: true,
                action: () => {
                  cfg.accounts.remove(state);
                  setState(undefined);
                },
              })
            }
            current={current}
          />
        )}
      </div>
    </div>
  );
}
