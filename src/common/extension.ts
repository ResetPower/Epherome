export interface EphExtensionMeta {
  name: string;
  version: string;
  apiVersion: string;
  introduction?: string;
}

export interface EphExtension {
  id: string;
  meta: EphExtensionMeta;
  runnable: string;
}
