const fabricUrlUtil = () => ({
  meta(): string {
    // bmclapi support is not available
    return "https://meta.fabricmc.net";
  },
  loaders(): string {
    return `${this.meta()}/v2/versions/loader`;
  },
  games(): string {
    return `${this.meta()}/v2/versions/game`;
  },
  json(mc: string, loader: string): string {
    return `${this.meta()}/v2/versions/loader/${mc}/${loader}/profile/json`;
  },
});

export default fabricUrlUtil;
