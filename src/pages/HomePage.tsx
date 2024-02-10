import Button from "../components/Button";
import { launchMinecraft } from "../core/launch";
import { cfg } from "../stores/config";
import { tr } from "../internationalize";

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
        <p>{tr.home.account}: {account?.name ?? tr.home.unselected}</p>
        <p>{tr.home.profile}: {profile?.name ?? tr.home.unselected}</p>
      </div>
      <div className="flex justify-end">
        <Button onClick={launch} disabled={!available} primary>
          {tr.home.launch}
        </Button>
      </div>
    </div>
  );
}
