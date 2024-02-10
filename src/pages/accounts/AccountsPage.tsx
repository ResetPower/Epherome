import { MdAdd } from "react-icons/md";
import { cfg } from "../../stores/config";
import { useState } from "react";
import CreateAccountFragment from "./CreateAccountFragment";
import ListTile from "../../components/ListTile";
import AccountDetailFragment from "./AccountDetailFragment";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { confirm } from "@tauri-apps/api/dialog";
import { tr } from "../../internationalize";
import formatString from "../../core/stringFormatting";

export default function AccountsPage() {
  const [state, setState] = useState(cfg.accounts.active);
  const current = state && state !== "create" && cfg.accounts.find(state);

  return (
    <div className="flex w-full">
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex-grow p-3 space-y-1">
          {cfg.accounts.isEmpty ? (
            <Center className="text-gray-500">{tr.account.noAccount}</Center>
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
          {tr.account.action.create}
        </WideButton>
      </div>
      <div className="flex-grow p-3">
        {!state && (
          <Center>{tr.account.action.selectAccount}</Center>
        )}
        {state === "create" && (
          <CreateAccountFragment goBack={() => setState(cfg.accounts.active)} />
        )}
        {current && (
          <AccountDetailFragment
            onRemove={() =>
              confirm(
                formatString(tr.account.action.ensureRemove, current.name)
              ).then((result) => {
                if (result) {
                  cfg.accounts.remove(state);
                  setState(undefined);
                }
              })
            }
            current={current}
          />
        )}
      </div>
    </div>
  );
}
