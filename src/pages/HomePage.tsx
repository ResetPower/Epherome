import Button from "../components/Button";
import { launchMinecraft } from "../core/launch";
import { t } from "../intl";
import { cfg } from "../stores/config";

export default function HomePage() {
  const [account, instance] = [cfg.accounts.current(), cfg.instances.current()];
  const available = account && instance;

  const launch = () => {
    if (available) {
      launchMinecraft({
        account,
        instance,
        provider: "official",
      }).then().catch;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-12">
      <div className="flex-grow" />
      <div>
        <p>
          {t.account}: {account?.name ?? t.unselected}
        </p>
        <p>
          {t.instance}: {instance?.name ?? t.unselected}
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={launch} disabled={!available} primary>
          {t.home.launch}
        </Button>
      </div>
    </div>
  );
}
