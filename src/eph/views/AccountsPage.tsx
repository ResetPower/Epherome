import { Alert } from "../components/layouts";
import {
  Button,
  Select,
  TextField,
  List,
  ListItem,
  TabBar,
  TabBarItem,
  TabBody,
  TabContext,
  TabController,
  Spinner,
  Center,
  Info,
} from "@resetpower/rcs";
import {
  createAccount,
  CreateAccountImplResult,
  MinecraftAccount,
  removeAccount,
  updateAccountToken,
} from "common/struct/accounts";
import { configStore, setConfig } from "common/struct/config";
import { MdCheck, MdClear, MdCreate, MdDelete, MdEdit } from "react-icons/md";
import { showOverlay } from "../overlay";
import { useState } from "react";
import { adapt, call, DefaultFn } from "common/utils";
import { t } from "../intl";
import { _ } from "common/utils/arrays";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { downloadSkin } from "core/model/skin";
import { BiExport, BiLogInCircle } from "react-icons/bi";
import { commonLogger } from "common/loggers";
import { Avatar, Body } from "eph/components/skin";
import { ipcRenderer } from "electron";
import {
  authCode2AuthToken,
  authToken2MinecraftTokenDirectly,
  validateMicrosoft,
} from "core/auth/microsoft";
import { GiSpanner } from "react-icons/gi";

export function CreateAccountFragment(props: {
  onDone: DefaultFn;
}): JSX.Element {
  const [errAlert, setErrAlert] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [msAccNoMcAlert, setMsAccNoMcAlert] = useState(false);
  const [value, setValue] = useState("microsoft");
  const [authserver, setAuthserver] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = () => {
    setLoading(true);
    setErrAlert(false);
    setMsAccNoMcAlert(false);
    createAccount(value, name, password, authserver).then(
      (value: CreateAccountImplResult) => {
        setLoading(false);
        if (value.success) {
          call(props.onDone);
        } else {
          if (value.message === "msAccNoMinecraft") {
            setMsAccNoMcAlert(true);
          } else {
            setErrAlert(true);
          }
        }
      }
    );
  };

  return (
    <div className="p-3">
      <div className="space-y-3">
        {errAlert && (
          <div className="my-3">
            <Alert severity="warn">{t("account.errCreating")}</Alert>
          </div>
        )}
        {msAccNoMcAlert && (
          <div className="my-3">
            <Alert severity="warn">{t("account.msAccNoMinecraft")}</Alert>
          </div>
        )}
        <div className="w-1/2">
          <Select
            fullWidth
            value={value}
            options={[
              { value: "microsoft", text: t("account.microsoft") },
              { value: "authlib", text: t("account.authlib") },
              { value: "offline", text: t("account.offline") },
            ]}
            onChange={setValue}
          />
        </div>
        <div hidden={value !== "microsoft"}>
          <p>{t("account.clickToLogin")}</p>
        </div>
        <div hidden={value !== "authlib"}>
          <TextField
            label={t("authserver")}
            value={authserver}
            onChange={setAuthserver}
          />
          <TextField label={t("email")} value={name} onChange={setName} />
          <TextField
            label={t("password")}
            value={password}
            onChange={setPassword}
            type="password"
          />
        </div>
        <div hidden={value !== "offline"}>
          <TextField label={t("username")} value={name} onChange={setName} />
        </div>
      </div>
      <div className="flex">
        <div className="flex-grow">{isLoading && <Spinner />}</div>
        <Button className="text-shallow" onClick={props.onDone}>
          {t("cancel")}
        </Button>
        <Button disabled={isLoading} onClick={handleCreate}>
          {t("create")}
        </Button>
      </div>
    </div>
  );
}

export function AccountGeneralFragment(props: {
  current: MinecraftAccount;
}): JSX.Element {
  const [stat, setStat] = useState<boolean | "err" | "succ">(false);
  const [ctaResult, setCtaResult] = useState<boolean | null>(null);
  const handleRemove = (selected: MinecraftAccount) =>
    showOverlay({
      title: t("account.removing"),
      message: t("confirmRemoving"),
      action: () => removeAccount(selected),
      dangerous: true,
      cancellable: true,
      positiveText: t("remove"),
    });

  const handleLoginAgain = () => {
    if (props.current.mode === "microsoft") {
      setStat(true);
      ipcRenderer.invoke("ms-auth").then(async (result) => {
        let code = "";
        const split = result.split("&");
        for (const i of split) {
          const j = i.split("=");
          if (j[0] === "code") {
            code = j[1];
          }
        }
        if (code) {
          const authTokenResult = await authCode2AuthToken(code);
          const accessToken = authTokenResult.access_token;
          const refreshToken = authTokenResult.refresh_token;
          if (accessToken && refreshToken) {
            const mcTokenResult = await authToken2MinecraftTokenDirectly(
              accessToken
            );
            if (mcTokenResult.token) {
              updateAccountToken(
                props.current,
                mcTokenResult.token,
                authTokenResult.refresh_token
              );
              setStat("succ");
              return;
            }
          }
          setStat("err");
        }
      });
    }
  };

  const handleCheckTokenAvailability = () => {
    setCtaResult(validateMicrosoft(props.current.token));
  };

  return (
    <div className="flex flex-col">
      <div className="flex-grow">
        <Info title={t("name")}>{props.current.name}</Info>
        <p className="text-shallow text-sm">
          {props.current && t(`account.${props.current.mode}`)}
        </p>
      </div>
      {props.current.mode === "microsoft" && (
        <div className="mt-10 mb-5 space-y-3">
          <div className="flex items-center">
            <Button onClick={handleCheckTokenAvailability}>
              <GiSpanner /> {t("checkTokenAvailability")}
            </Button>
            {ctaResult !== null &&
              (ctaResult ? (
                <>
                  <MdCheck className="text-green-500" />{" "}
                  <p>{t("token.available.true")}</p>
                </>
              ) : (
                <>
                  <MdClear className="text-danger" />{" "}
                  <p>{t("token.available.false")}</p>
                </>
              ))}
          </div>
          <div className="flex items-center">
            <Button onClick={handleLoginAgain} disabled={stat === true}>
              <BiLogInCircle /> {t("msLoginAgain")}
            </Button>

            {stat === "succ" && (
              <>
                <MdCheck className="text-green-500" /> <p>{t("doneMessage")}</p>
              </>
            )}
            {stat === "err" && (
              <>
                <MdClear className="text-danger" /> <p>{t("errorOccurred")}</p>
              </>
            )}
          </div>
        </div>
      )}
      <div className="flex mt-3">
        {stat === true && <Spinner />}
        <div className="flex-grow" />
        <Button
          className="text-danger"
          onClick={() => props.current && handleRemove(props.current)}
        >
          <MdDelete /> {t("remove")}
        </Button>
      </div>
    </div>
  );
}

export function AccountSkinFragment(props: {
  current: MinecraftAccount;
}): JSX.Element {
  const [exporting, setExporting] = useState(false);

  if (!adapt(props.current.mode, "mojang", "microsoft")) {
    return <p>{t("account.skin.notSupportedExcludeMojangMs")}</p>;
  }

  const uuid = props.current.uuid;
  const handleExport = () => {
    setExporting(true);
    downloadSkin(uuid)
      .then((target) => {
        setExporting(false);
        showOverlay({
          message: t("exportedAt", target),
        });
      })
      .catch((err) => {
        commonLogger.warn("Error occurred downloading skin: " + err);
        setExporting(false);
        showOverlay({
          message: t("internetNotAvailable"),
        });
      });
  };
  const handleEdit = () => {
    showOverlay({
      message: t("notSupportedYet"),
    });
  };

  return (
    <div className="flex justify-center space-x-9">
      <Body uuid={uuid} />
      <div>
        <Button disabled={exporting} onClick={handleExport}>
          {exporting ? <Spinner indent /> : <BiExport />} {t("export")}
        </Button>
        <Button onClick={handleEdit}>
          <MdEdit /> {t("edit")}
        </Button>
      </div>
    </div>
  );
}

const AccountsPage = observer(() => {
  const tabRef = useRef<TabContext>();
  const [creating, setCreating] = useState(false);
  const handleCreate = () => setCreating(true);

  const accounts = configStore.accounts;
  const current = _.selected(accounts);

  return (
    <div className="flex eph-h-full">
      <div className="overflow-y-auto bg-card z-10 shadow-md py-3 w-1/4">
        <div className="py-1 px-3">
          <Button variant="contained" onClick={handleCreate}>
            <MdCreate />
            {t("create")}
          </Button>
        </div>
        <List className="space-y-3">
          {_.map(accounts, (i, id) => (
            <ListItem
              className="px-3 py-2 mx-2 rounded-lg"
              active={!creating && current === i}
              onClick={() => {
                creating && setCreating(false);
                i.selected
                  ? setConfig(() => _.deselect(accounts))
                  : setConfig(() => _.select(accounts, i));
                tabRef.current?.setValue(0);
              }}
              key={id}
            >
              {adapt(i.mode, "mojang", "microsoft") ? (
                <Avatar uuid={i.uuid} />
              ) : (
                <Avatar uuid="MHF_Steve" />
              )}
              <p className="flex px-1 space-x-1">{i.name}</p>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="flex-grow p-6 w-3/4">
        {creating ? (
          <CreateAccountFragment onDone={() => setCreating(false)} />
        ) : current ? (
          <TabController orientation="horizontal" contextRef={tabRef}>
            <TabBar>
              <TabBarItem value={0}>{t("general")}</TabBarItem>
              <TabBarItem value={1}>{t("account.skin")}</TabBarItem>
            </TabBar>
            <TabBody>
              <AccountGeneralFragment current={current} />
              <AccountSkinFragment current={current} />
            </TabBody>
          </TabController>
        ) : (
          <Center>
            <p className="text-shallow">{t("account.notSelected")}</p>
          </Center>
        )}
      </div>
    </div>
  );
});

export default AccountsPage;
