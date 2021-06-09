import os from "os";

export const OPERATING_SYSTEM = os.platform();
export const OPERATING_VERSION = os.version();

export type MinecraftVersionType = "release" | "snapshot" | "old_beta" | "old_alpha";

export interface MinecraftVersion {
  id: string;
  type: MinecraftVersionType;
  url: string;
}

export interface MinecraftCommonRule {
  action: "allow" | "disallow";
  os: MinecraftOSRule;
}

export interface MinecraftOSRule {
  name?: string;
  version?: string;
  arch?: string;
}

export function equalOS(anotherOS: string): boolean {
  // linux: linux
  if (OPERATING_SYSTEM === anotherOS) {
    return true;
  }
  // win32: windows
  if (OPERATING_SYSTEM === "win32") return anotherOS === "windows";
  // darwin: osx or macos
  if (OPERATING_SYSTEM === "darwin") return anotherOS === "osx" || anotherOS === "macos";
  return false;
}

export function isOSCompliant(rule: MinecraftOSRule): boolean {
  if (rule.name) {
    if (rule.version) {
      if (equalOS(rule.name) || OPERATING_VERSION.startsWith(rule.version)) {
        return true;
      }
    } else {
      if (equalOS(rule.name)) {
        return true;
      }
    }
  }
  if (rule.arch === "x86") {
    return true;
  }
  return false;
}

export function isCompliant(rules: MinecraftCommonRule[]): boolean {
  let ret = false;
  for (const i of rules) {
    const a = i.action;
    if (i.os) {
      const o = i.os;
      if (a === "disallow") {
        if (isOSCompliant(o)) {
          ret = false;
        }
      } else if (a === "allow") {
        if (isOSCompliant(o)) {
          ret = true;
        }
      }
    } else {
      if (a === "allow") {
        ret = true;
      } else if (a === "disallow") {
        ret = false;
      }
    }
  }
  return ret;
}
