import { apply, call, DefaultFn, HashMap, StringMap } from "common/utils";
import { action, makeObservable, observable } from "mobx";
import { MutableRefObject } from "react";
import { Task, TaskType } from ".";

export class TaskStore {
  @observable
  tasks: Task[] = [];
  onProgressChange?: (id: number, progress: number) => unknown;
  constructor() {
    makeObservable(this);
  }
  private find(id: number): Task | undefined {
    for (const i of this.tasks) {
      if (i.id === id) {
        return i;
      }
    }
  }
  @action
  register(
    name: string,
    type: TaskType,
    initMap?: StringMap,
    opener?: DefaultFn
  ): Task {
    const task = new Task(name, type);
    initMap && (task.hashMap = new HashMap(initMap));
    opener && (task.opener = opener);
    this.tasks.push(task);
    return task;
  }
  @action
  finish(task: Task | MutableRefObject<Task | undefined>) {
    let t: Task | undefined = undefined;
    if ("_" in task) {
      t = task;
    } else {
      t = task.current;
      task.current = undefined;
    }
    this.tasks = this.tasks.filter((v) => v !== t);
  }
  @action
  error(id: number, error: Error) {
    apply(this.find(id), (t) => t.err(error));
  }
  @action
  setProgress(id: number, percentage: number) {
    apply(this.find(id), (t) => (t.percentage = percentage));
    call(this.onProgressChange, id, percentage);
  }
  findByType(type: TaskType): Task | null {
    for (const task of this.tasks) {
      if (task.type === type) {
        return task;
      }
    }
    return null;
  }
}

export const taskStore = new TaskStore();
