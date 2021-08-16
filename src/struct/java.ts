import { WithUnderline, _ } from "../tools/arrays";
import { setConfig } from "./config";

export interface Java extends WithUnderline {
  nanoid: string;
  dir: string;
  name: string;
  is64Bit: boolean;
}

export function createJava(java: Java): void {
  setConfig((cfg) => {
    _.append(cfg.javas, java);
    if (cfg.javas.length === 1) {
      _.select(cfg.javas, java);
    }
  });
}

export function removeJava(java: Java): void {
  setConfig((cfg) => _.remove(cfg.javas, java));
}
