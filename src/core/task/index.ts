export type TaskStatus = "running" | "cancelled";

export class Task {
  id: number;
  status: TaskStatus = "running";
  constructor(id: number) {
    this.id = id;
  }
}
