import { WithUnderline, _ } from "common/utils/arrays";
import { checkJava } from "core/java";
import { findJavaHome } from "core/java/finder";
import { nanoid } from "nanoid";
import { configStore, setConfig } from "./config";

// initialize java config
export async function initializeJava() {
  if (configStore.javas.length === 0) {
    const javas = await findJavaHome();
    if (javas) {
      for (const i of javas) {
        try {
          const java = await checkJava(i);
          java && createJava(java, false);
        } catch (e) {
          console.error(e);
        }
      }
      configStore.save();
    }

    // select the first java instance as initialization
    if (configStore.javas.length !== 0) {
      _.select(configStore.javas, configStore.javas[0]);
    }
  }
}

// process java instances of old epherome
for (const i of configStore.javas) {
  if (!i.nanoid) {
    i.nanoid = nanoid();
  }
}

export interface Java extends WithUnderline {
  nanoid: string;
  dir: string;
  name: string; // version name
  is64Bit: boolean;
  nickname?: string; // created by user manually
}

export type JavaWithoutNanoid = Omit<Java, "nanoid">;

export function createJava(java: JavaWithoutNanoid, save = true): void {
  setConfig((cfg) => {
    _.append(cfg.javas, { ...java, nanoid: nanoid() }, !_.selected(cfg.javas));
    if (cfg.javas.length === 1) {
      _.select(cfg.javas, java);
    }
  }, save);
}

export function removeJava(java: Java): void {
  setConfig((cfg) => _.remove(cfg.javas, java));
}
