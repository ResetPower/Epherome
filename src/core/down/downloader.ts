import got from "got";
import path from "path";
import fs, { WriteStream } from "fs";
import { call, DefaultFn, ErrorHandler } from "common/utils";
import { ensureDir } from "common/utils/files";
import { pipeline } from "stream";
import { ObjectWrapper } from "common/utils/object";
import { coreLogger } from "common/loggers";

export type DownloaderDetailsListener = (
  details: ObjectWrapper<DownloaderTask[]>,
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
  error?: Error;
  finished = false;
  private stream: WriteStream;
  constructor(
    options: DownloaderTaskOptions,
    updateDetails: DefaultFn,
    finishCallback: (task: DownloaderTask, error?: boolean) => void
  ) {
    const handleError = (error: Error) => {
      coreLogger.error("Error occurred during download");
      // destroy download task on error
      // in order to avoid unexpected things
      this.destroy();
      this.error = error;
      // have to "finish"
      finishCallback(this);
    };
    this.url = options.url;
    this.target = options.target;
    // prepare files
    ensureDir(path.dirname(this.target));
    this.filename = path.basename(this.target);
    // initialize streams
    const downloadStream = got.stream(this.url);
    downloadStream
      .on("downloadProgress", ({ percent }) => {
        const newPercentage = Math.round(percent * 100);
        // don't repeat updating to keep performance
        if (this.percentage !== newPercentage) {
          this.percentage = newPercentage;
          updateDetails();
        }
      })
      .on("error", handleError);
    const fileStream = fs.createWriteStream(this.target);
    // pipe streams to start download
    this.stream = pipeline(downloadStream, fileStream, (error) => {
      if (error) {
        handleError(error);
      } else {
        this.finished = true;
        finishCallback(this);
      }
    });
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
  stopOnError?: boolean;
}

export class Downloader {
  cancelled = false;
  finishedTasks = 0;
  concurrency = 0;
  tasks: DownloaderTask[] = [];
  errors: DownloaderTask[] = [];
  taskOptions: DownloaderTaskOptions[] = [];
  onDetailsChange?: DownloaderDetailsListener;
  onError?: ErrorHandler;
  onDone?: DefaultFn;
  stopOnError = false;
  constructor(options: DownloaderOptions) {
    if (options.taskOptions.length === 0) {
      options.onDone();
    } else {
      this.taskOptions = options.taskOptions;
      this.concurrency = options.concurrency;
      this.onDetailsChange = options.onDetailsChange;
      this.onError = options.onError;
      this.onDone = options.onDone;
      this.stopOnError = options.stopOnError ?? false;
    }
  }
  updateDetails = (): void => {
    // evaluate total percentage
    const percentage =
      (this.tasks.map((task) => task.percentage).reduce((a, b) => a + b, 0) +
        this.finishedTasks * 100) /
      this.taskOptions.length;
    call(
      this.onDetailsChange,
      new ObjectWrapper(this.tasks),
      Math.floor(percentage)
    );
  };
  finishOne = (task: DownloaderTask): void => {
    if (task.error && this.stopOnError) {
      this.cancel();
      call(this.onError, task.error);
    }
    // remove finished tasks
    this.tasks.splice(this.tasks.indexOf(task), 1);
    this.finishedTasks++;
    this.updateDetails();
    // check if tasks are all completed
    if (this.tasks.length === 0) {
      call(this.onDone);
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
