export interface EphExtensionManifest {
  name: string;
  version: string;
  apiVersion: string;
  entry: string;
}

export interface EphExtension {
  id: string;
  manifest: EphExtensionManifest;
  pathname: string;
  readme: string;
}
