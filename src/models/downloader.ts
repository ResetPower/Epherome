import got from "got";
import path from "path";
import fs, { WriteStream } from "fs";
import { DefaultFn, ErrorHandler, unwrapFunction } from "../tools";
import { createDirByPath } from "../models/files";
import { pipeline } from "stream";

export type DownloaderDetailsListener = (
  details: DownloaderTask[],
  totalPercentage: number
) => unknown;

export interface DownloaderTaskOptions {
  url: string;
  target: string;
}

export class DownloaderTask {
  url: string;
  target: string;
  filename: string;
  percentage = 0;
  error = false;
  finished = false;
  private stream: WriteStream;
  constructor(
    options: DownloaderTaskOptions,
    updateDetails: DefaultFn,
    finishCallback: (task: DownloaderTask, error?: boolean) => void
  ) {
    this.url = options.url;
    this.target = options.target;
    // prepare files
    createDirByPath(this.target);
    this.filename = path.basename(this.target);
    // initialize streams
    const downloadStream = got.stream(this.url);
    downloadStream.on("downloadProgress", ({ percent }) => {
      const newPercentage = Math.round(percent * 100);
      // don't repeat updating to keep performance
      if (this.percentage !== newPercentage) {
        this.percentage = newPercentage;
        updateDetails();
      }
    });
    const fileStream = fs.createWriteStream(this.target);
    // pipe streams to start download
    const stream = pipeline(downloadStream, fileStream, (error) => {
      if (error) {
        // destroy download task on error
        // in order to avoid unexpected things
        this.destroy();
        this.error = true;
        // have to finish
        finishCallback(this, true);
      } else {
        this.finished = true;
        finishCallback(this);
      }
    });
    this.stream = stream;
  }
  // cancel download in just this task
  destroy(): void {
    this.stream.close();
    try {
      // delete downloaded part
      fs.rmSync(this.target);
    } catch {}
  }
}

export interface DownloaderOptions {
  taskOptions: DownloaderTaskOptions[];
  concurrency: number;
  onDetailsChange: DownloaderDetailsListener;
  onError: ErrorHandler;
  onDone: DefaultFn;
}

export class Downloader {
  cancelled = false;
  finishedTasks = 0;
  concurrency = 0;
  tasks: DownloaderTask[] = [];
  errors: DownloaderTask[] = [];
  taskOptions: DownloaderTaskOptions[] = [];
  onDetailsChange: DownloaderDetailsListener = unwrapFunction();
  onError: ErrorHandler = unwrapFunction();
  onDone: DefaultFn = unwrapFunction();
  constructor(options: DownloaderOptions) {
    if (options.taskOptions.length === 0) {
      options.onDone();
    } else {
      this.taskOptions = options.taskOptions;
      this.concurrency = options.concurrency;
      this.onDetailsChange = options.onDetailsChange;
      this.onError = options.onError;
      this.onDone = options.onDone;
    }
  }
  updateDetails = (): void => {
    // evaluate total percentage
    const percentage =
      (this.tasks.map((task) => task.percentage).reduce((a, b) => a + b, 0) +
        this.finishedTasks * 100) /
      this.taskOptions.length;
    this.onDetailsChange(this.tasks.slice(), Math.floor(percentage));
  };
  finishOne = (task: DownloaderTask, _error = false): void => {
    // remove finished tasks
    this.tasks.splice(this.tasks.indexOf(task), 1);
    this.finishedTasks++;
    this.updateDetails();
    // check if tasks are all completed
    if (this.tasks.length === 0) {
      this.onDone();
    } else {
      // add new task to the task list
      this.start();
    }
  };
  start = (): void => {
    // search for not added task options
    // and add them if the current total task number
    // is less than the maximum number
    for (const k in this.taskOptions) {
      if (this.tasks.length < this.concurrency) {
        this.tasks.push(
          new DownloaderTask(
            this.taskOptions[k],
            this.updateDetails,
            this.finishOne
          )
        );
        // remove task options on added
        // Note that remove with delete to reserve the length of it
        delete this.taskOptions[k];
      } else {
        break;
      }
    }
  };
  cancel = (): void => {
    this.cancelled = true;
    // destroy all doing tasks
    this.tasks.forEach((i) => i.destroy());
    this.tasks.length = 0;
  };
}
