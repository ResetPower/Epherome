import { action, computed, makeObservable, observable } from "mobx";

export type NotificationType = "info" | "warn" | "error";

export interface Notification {
  type: NotificationType;
  message: string;
  source: string;
  read?: boolean;
}

export class NotificationStore {
  @computed
  get withUnread() {
    return this.notifications.filter((n) => !n.read).length !== 0;
  }
  @observable
  notifications: Notification[] = [];
  constructor() {
    makeObservable(this);
  }
  @action
  read(notification: Notification): boolean {
    return (notification.read = true);
  }
  @action
  push(notification: Notification) {
    this.notifications.push(notification);
  }
  @action
  remove(notification: Notification) {
    this.notifications = this.notifications.filter((n) => n !== notification);
  }
}

export const notificationStore = new NotificationStore();
