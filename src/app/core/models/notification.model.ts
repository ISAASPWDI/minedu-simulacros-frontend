export type NotificationType = 'SUBSCRIPTION_EXPIRING' | 'PENDING_SIMULATION';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}
