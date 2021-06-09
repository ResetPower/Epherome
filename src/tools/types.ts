// empty props type for web component
export type EmptyProps = Record<string, unknown>;

// empty state type for web component
export type EmptyState = Record<string, unknown>;

// response object transformed from main process
export interface EphResponse {
  err: boolean;
  text: string;
  status: number;
}
