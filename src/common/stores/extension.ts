export interface EphExtension {
  id: string;
  meta: EphExtensionMeta;
  runnable: string;
}

export type EphExtensionTranslations = "zh-cn" | "ja-jp" | "en-us";

export interface EphExtensionMeta {
  name: string;
  translations: {
    [key in EphExtensionTranslations]?: string;
  } & { default: string };
  version: string;
  apiVersion: string;
  application?: {
    entrance: string;
  };
}

export class ExtensionStore {
  extensions: EphExtension[] = [];
}

export const extensionStore = new ExtensionStore();
