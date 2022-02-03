export type EphExtensionTranslations = "en-us" | "zh-cn" | "ja-jp";

export interface EphExtensionMeta {
  name: string;
  translations: {
    [key in EphExtensionTranslations]?: string;
  } & { default: string };
  version: string;
  apiVersion: string;
  introduction?: string;
}

export interface EphExtension {
  id: string;
  meta: EphExtensionMeta;
  runnable: string;
}
