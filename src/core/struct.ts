import { StringMap } from "../tools/types";
import { MinecraftVersionType } from "./versions";

export type ClientJsonArguments = (
  | string
  | {
      rules: ClientJsonRules;
      value: string | string[];
    }
)[];

// Note that there are two kinds of library object
// First: without `url` key
// Second: with only `name` and `url` key (It seems to be LiteLoader or Fabric)
export interface ClientJsonLibrary {
  downloads?: {
    artifact?: ClientJsonCommonArtifact;
    classifiers?: { [key: string]: ClientJsonCommonArtifact };
  };
  name?: string;
  url?: string;
  natives?: StringMap;
  extract?: {
    exclude?: string[];
  };
  rules?: ClientJsonRules;
}

export type ClientJsonLibraries = ClientJsonLibrary[];

export interface ClientJsonOSRule {
  name?: string;
  version?: string;
  arch?: string;
}

export interface ClientJsonRule {
  action: "allow" | "disallow";
  os?: ClientJsonOSRule;
  features?: {
    is_demo_user?: boolean;
    has_custom_resolution?: boolean;
  };
}

export type ClientJsonRules = ClientJsonRule[];

export interface ClientJsonCommonArtifact {
  path: string;
  sha1: string;
  size: number;
  url: string;
}

export function mergeClientJson(parsed: ClientJson, inherit: ClientJson): ClientJson {
  const ret = { ...inherit, ...parsed };
  ret.libraries.push(...inherit.libraries);
  return ret;
}

export interface ClientJson {
  arguments?: {
    game: ClientJsonArguments;
    jvm: ClientJsonArguments;
  };
  inheritsFrom?: string;
  minecraftArguments?: string;
  assetIndex: {
    id: string;
    sha1: string;
    size: number;
    totalSize: number;
    url: string;
  };
  assets: string;
  downloads: {
    sha1: string;
    size: number;
    url: string;
  };
  id: string;
  libraries: ClientJsonLibraries;
  mainClass: string;
  releaseTime: string;
  time: string;
  type: MinecraftVersionType;
  jar?: string;
  patches?: ClientJson[]; // appears in minecraft json file of HMCL
}

export interface ClientAnalyzedLibrary {
  name: string;
  path: string;
  url: string;
  sha1?: string;
}

export interface ClientLibraryResult {
  classpath: string[];
  natives: string[];
  missing: ClientAnalyzedLibrary[];
}
