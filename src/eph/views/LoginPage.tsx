import { Button, Hyperlink, Spinner, TextField } from "@resetpower/rcs";
import { commonLogger } from "common/loggers";
import { personalStore } from "common/stores/personal";
import { openInBrowser } from "common/utils/open";
import { t } from "eph/intl";
import { historyStore } from "eph/renderer/history";
import got from "got";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function LoginPage(): JSX.Element {
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (username === "" || password === "") {
      setMessage("Incomplete Information");
      return;
    }
    setMessage("Pending...");
    commonLogger.info(`Trying to login Epherome account. User: ${username}`);
    got
      .post("https://epherome.com/auth/login", {
        body: JSON.stringify({ username, password }),
      })
      .then((resp) => {
        personalStore.login(JSON.parse(resp.body).token);
        historyStore.back();
        historyStore.push("ephPersonalCenter");
        commonLogger.info(`Logged in.`);
      })
      .catch((error) => {
        try {
          setMessage(JSON.parse(error.response.body).message);
        } catch {
          setMessage(t("internetNotAvailable"));
        }
        throw error;
      });
  };

  const pending = message === "Pending...";

  return (
    <div className="p-9 space-y-3">
      <p className="font-semibold text-xl">{t("personal.loginTo")}</p>
      <TextField
        label={t("username")}
        placeholder={t("username")}
        value={username}
        onChange={setUsername}
      />
      <TextField
        label={t("password")}
        type={visible ? undefined : "password"}
        placeholder={t("password")}
        value={password}
        onChange={setPassword}
        trailing={
          <Hyperlink button onClick={() => setVisible(!visible)}>
            {visible ? <MdVisibilityOff /> : <MdVisibility />}
          </Hyperlink>
        }
      />
      <div className="flex items-center space-x-3">
        <Button variant="pill" onClick={handleLogin} disabled={pending}>
          {t("personal.login")}
        </Button>
        {pending && <Spinner />}
        <p className="flex-grow">{message}</p>
        <Hyperlink
          onClick={() => openInBrowser("https://epherome.com/register")}
        >
          {t("personal.register")}...
        </Hyperlink>
      </div>
    </div>
  );
}
