import { Button, Hyperlink, Spinner, TextField } from "@resetpower/rcs";
import { commonLogger } from "common/loggers";
import { personalStore } from "common/stores/personal";
import { openInBrowser } from "common/utils/open";
import { t } from "eph/intl";
import { historyStore } from "eph/renderer/history";
import got from "got";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const ERROR_MESSAGES = {
  INCOMPLETE_INFORMATION: "Incomplete Information",
  WRONG_CREDENTIALS: "Password or username wrong.",
  INTERNET_NOT_AVAILABLE: t("internetNotAvailable"),
};

export default function LoginPage(): JSX.Element {
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage(ERROR_MESSAGES.INCOMPLETE_INFORMATION);
      return;
    }

    setMessage("Pending...");
    commonLogger.info(`Trying to login Epherome account. User: ${username}`);

    try {
      const response = await got.post("https://api.epherome.com/auth/login", {
        json: { name: username, password },
      });
      const accessToken = JSON.parse(response.body).accessToken;
      personalStore.login(accessToken);
      historyStore.back();
      historyStore.push("ephPersonalCenter");
      commonLogger.info(`Logged in.`);
    } catch (error) {
      if ((error as any)?.response?.statusCode === 403) {
        setMessage(ERROR_MESSAGES.WRONG_CREDENTIALS);
      } else {
        setMessage(ERROR_MESSAGES.INTERNET_NOT_AVAILABLE);
      }
      console.error(error);
    }
  };

  const isPending = message === "Pending...";

  return (
    <div className="p-9 space-y-3">
      <p className="font-medium text-xl">{t("personal.loginTo")}</p>
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
        <Button variant="pill" onClick={handleLogin} disabled={isPending}>
          {t("personal.login")}
        </Button>
        {isPending && <Spinner />}
        <p className="flex-grow">{message}</p>
        <Hyperlink onClick={() => openInBrowser("https://epherome.com/register")}>
          {t("personal.register")}...
        </Hyperlink>
      </div>
    </div>
  );
}
