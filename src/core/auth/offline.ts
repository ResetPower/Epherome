import { cfg } from "../../stores/config";
import { uuidv4 } from "../../utils";

export default function createOfflineAccount(name: string) {
  cfg.accounts.add({ name, uuid: uuidv4(), type: "offline" }, true);
}
