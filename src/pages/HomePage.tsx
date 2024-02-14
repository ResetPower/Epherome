import { useState } from "react";
import Button from "../components/Button";
import Info from "../components/Info";
import { launchMinecraft } from "../core/launch";
import { t } from "../intl";
import { cfg } from "../stores/config";

export default function HomePage() {
  const [account, instance] = [cfg.accounts.current(), cfg.instances.current()];
  const available = account && instance;
  const [helper, setHelper] = useState(String());
  const [launching, setLaunching] = useState(false);

  const launch = () => {
    if (available) {
      launchMinecraft({
        account,
        instance,
        provider: cfg.downloadProvider,
        setHelper,
      }).then(() => setLaunching(false)).catch;
      setLaunching(true);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-12">
      <div className="flex-grow" />
      <div className="rounded border p-3">
        <div>
          <Info name={t.account}>{account?.name ?? t.unselected}</Info>
          <Info name={t.instance}>{instance?.name ?? t.unselected}</Info>
        </div>
        <div className="flex justify-end">
          <Button onClick={launch} disabled={!available || launching} primary>
            {t.home.launch}
          </Button>
        </div>
        <div className="text-gray-500 px-3">{helper}</div>
      </div>
    </div>
  );
}
