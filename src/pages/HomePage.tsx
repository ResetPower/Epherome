import Button from "../components/Button";
import { cfg } from "../stores/config";

export default function HomePage() {
  const [cAcc, cPrf] = [cfg.accounts.current(), cfg.profiles.current()];

  return (
    <div className="flex flex-col w-full h-full p-12">
      <div className="flex-grow" />
      <div>
        <p>Account: {cAcc?.name ?? "Unselected"}</p>
        <p>Profile: {cPrf?.name ?? "Unselected"}</p>
      </div>
      <div className="flex justify-end">
        <Button disabled={!(cAcc && cPrf)} primary>
          Launch
        </Button>
      </div>
    </div>
  );
}
