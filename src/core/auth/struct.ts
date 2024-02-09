export interface YggdrasilAuthenticateResult {
  accessToken: string;
  selectedProfile: {
    name: string;
    id: string;
  };
}

export interface YggdrasilRefreshResult {
  accessToken: string;
}
