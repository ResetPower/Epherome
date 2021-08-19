import os from "os";
import {
  ClientJsonRules,
  ClientJsonOSRule,
  ClientJsonFeaturesRule,
} from "./struct";

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
        equalOS(rule.name) && osVer.match(new RegExp(rule.version)) !== null
      : // only compare os name
        equalOS(rule.name);
  }
  return rule.arch === "x86";
}

export function isCompliant(
  rules: ClientJsonRules,
  features: ClientJsonFeaturesRule = {}
): boolean {
  let ret = false;
  for (const rule of rules) {
    const allowed = rule.action === "allow";
    if (rule.os) {
      // with os, compare os
      isOSCompliant(rule.os) && (ret = allowed);
    } else if (rule.features) {
      for (const i in rule.features) {
        const k = i as keyof ClientJsonFeaturesRule;
        const v = rule.features[k];
        if (v && features[k]) {
          ret = allowed;
        }
      }
    } else {
      // without os or feature
      ret = allowed;
    }
  }
  return rules.length === 0 ? true : ret;
}
