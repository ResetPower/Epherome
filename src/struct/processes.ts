import { WithId } from "../tools";
import { MinecraftProfile } from "./profiles";

export interface Process extends WithId {
  profile: MinecraftProfile;
  output: string[];
}
