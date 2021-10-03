import { ObjectWrapper } from "common/utils/object";

export type DownloaderDetailsListener = (
  details: ObjectWrapper<DownloadDetail[]>,
  totalPercentage: number
) => unknown;

export interface DownloadDetail {
  filename: string;
  percentage: number;
  inProgress: boolean;
}
