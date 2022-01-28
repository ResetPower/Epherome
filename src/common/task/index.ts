import { commonLogger } from "common/loggers";
import { call, DefaultFn, HashMap } from "common/utils";
import { shortid } from "common/utils/ids";
import { Canceller } from "./cancel";

export type TaskType = "installMinecraft" | "importModpack";

export interface SubTask {
  name: string;
  percentage: number;
  inProgress: boolean;
}

export class Task {
  _ = "Task";
  id: number;
  name: string;
  type: TaskType;
  // percentage -2 means this task was interrupted while -1 means not started
  percentage = -1;
  canceller: Canceller;
  hashMap: HashMap;
  subTasks: SubTask[] = [];
  opener?: DefaultFn;
  onSignal?: DefaultFn;
  constructor(name: string, type: TaskType) {
    this.id = shortid();
    this.name = name;
    this.type = type;
    this.canceller = new Canceller();
    this.hashMap = new HashMap();
  }
  putSubtask(tasks: SubTask[]) {
    this.subTasks = tasks;
  }
  cancel(): boolean {
    const cancellation = this.canceller.cancel();
    if (cancellation) {
      commonLogger.info(`Task#${this.id} interrupted by user's cancellation`);
    } else {
      commonLogger.info(`Task#${this.id} failed to be cancelled`);
    }
    this.percentage = -2;
    return cancellation;
  }
  err(error: Error) {
    commonLogger.warn(`Task#${this.id} interrupted by ${error.name}`);
    this.percentage = -2;
  }
  signal() {
    call(this.onSignal);
  }
  get isRunning() {
    return this.percentage >= 0 && this.percentage < 100;
  }
  get isCancelled() {
    return this.canceller.cancelled;
  }
}
