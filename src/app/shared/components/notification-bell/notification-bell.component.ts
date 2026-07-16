import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, ButtonModule, Popover],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  unreadCount = signal(0);
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);

  private pollHandle: any;

  ngOnInit(): void {
    this.refreshUnreadCount();
    this.pollHandle = setInterval(() => this.refreshUnreadCount(), 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollHandle);
  }

  refreshUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {}
    });
  }

  onOpen(): void {
    this.loading.set(true);
    this.notificationService.getMyNotifications(0, 10).subscribe({
      next: (page) => {
        this.notifications.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openNotification(notification: AppNotification): void {
    if (!notification.read) {
      this.notificationService.markRead(notification.id).subscribe({
        next: () => {
          this.notifications.update(list =>
            list.map(n => (n.id === notification.id ? { ...n, read: true } : n))
          );
          this.refreshUnreadCount();
        }
      });
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, read: true })));
        this.unreadCount.set(0);
      }
    });
  }
}
