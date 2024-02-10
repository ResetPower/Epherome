import Button from "../components/Button";
import { launchMinecraft } from "../core/launch";
import { t } from "../intl";
import { cfg } from "../stores/config";

export default function HomePage() {
  const [account, profile] = [cfg.accounts.current(), cfg.profiles.current()];
  const available = account && profile;

  const launch = () => {
    if (available) {
      launchMinecraft({
        account,
        profile,
        provider: "official",
      }).then().catch;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-12">
      <div className="flex-grow" />
      <div>
        <p>
          {t.account}: {account?.name ?? "Unselected"}
        </p>
        <p>
          {t.profile}: {profile?.name ?? "Unselected"}
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
