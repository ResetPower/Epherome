import os from "os";
import { ClientJsonRules, ClientJsonOSRule } from "./struct";

export const osName = os.platform();
export const osVer = os.version();

export function equalOS(name: string): boolean {
  // darwin: `osx` or `macos`
  if (osName === "darwin") return name === "osx" || name === "macos";
  // win32: `windows`
  if (osName === "win32") return name === "windows";
  // linux: `linux`
  return osName === name;
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
  let ret = false;
  rules.forEach((rule) => {
    const allowed = rule.action === "allow";
    rule.os
      ? // with os, compare os
        allowed === isOSCompliant(rule.os) && (ret = allowed)
      : // without os
        (ret = allowed);
  });
  return ret;
}
