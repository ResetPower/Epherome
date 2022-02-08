import { Button, Link, Spin, TextField } from "@resetpower/rcs";
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
      <p className="font-semibold text-xl">Login to Epherome</p>
      <TextField
        label="Username"
        placeholder="Username"
        value={username}
        onChange={setUsername}
      />
      <TextField
        label="Password"
        type={visible ? undefined : "password"}
        placeholder="Password"
        value={password}
        onChange={setPassword}
        trailing={
          <Link onClick={() => setVisible(!visible)}>
            {visible ? <MdVisibilityOff /> : <MdVisibility />}
          </Link>
        }
      />
      <div className="flex items-center space-x-3">
        <Button variant="pill" onClick={handleLogin} disabled={pending}>
          Login
        </Button>
        {pending && <Spin />}
        <p className="flex-grow">{message}</p>
        <Link onClick={() => openInBrowser("https://epherome.com/register")}>
          Register...
        </Link>
      </div>
    </div>
  );
}
