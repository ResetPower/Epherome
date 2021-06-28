import os from "os";
import { ClientJsonRules, ClientJsonOSRule } from "./struct";

export const osName = os.platform();
export const osVer = os.version();

export function equalOS(name: string): boolean {
  if (osName === name) return true;
  if (osName === "darwin") return name === "osx" || name === "macos";
  if (osName === "win32") return name === "windows";
  return false;
}

export function isOSCompliant(rule: ClientJsonOSRule): boolean {
  if (rule.name) {
    return rule.version
      ? // with version, compare both os name and version
        equalOS(rule.name) && osVer.startsWith(rule.version)
      : // only compare os name
        equalOS(rule.name);
  }
  return rule.arch === "x86";
}

export function isCompliant(rules: ClientJsonRules): boolean {
  let ret = true;
  for (const rule of rules) {
    const allowed = rule.action === "allow";
    if (rule.os) {
      // with os, compare os
      isOSCompliant(rule.os) && (ret = allowed);
    } else {
      // without os
      ret = allowed;
    }
  }
  return ret;
}
