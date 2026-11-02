
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AppNotification,
  NotificationService
} from '../notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: AppNotification[] = [];
  unreadCount = 0;

  loading = false;
  errorMessage = '';
  filter: 'all' | 'unread' = 'all';

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get visibleNotifications(): AppNotification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(item => !item.isRead);
    }

    return this.notifications;
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';

    // Pass a page number, not ownerId.
    this.notificationService.getNotifications(1, 100).subscribe({
      next: (response) => {
        this.notifications = response?.notifications || [];

        this.unreadCount = this.notifications.filter(
          item => !item.isRead
        ).length;

        if (typeof response?.unreadCount === 'number') {
          this.unreadCount = response.unreadCount;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);

        this.errorMessage =
          error?.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Unable to load notifications. Please try again.';

        this.loading = false;
      }
    });
  }

  setFilter(value: 'all' | 'unread'): void {
    this.filter = value;
  }

  markRead(item: AppNotification): void {
    if (!item?._id) {
      return;
    }

    if (!item.isRead) {
      this.notificationService.markAsRead(item._id).subscribe({
        next: () => {
          item.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.openAction(item);
        },
        error: (error) => {
          console.error('Failed to mark notification as read:', error);
          this.errorMessage = 'Unable to update this notification.';
        }
      });

      return;
    }

    this.openAction(item);
  }

  markAllRead(): void {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(item => ({
          ...item,
          isRead: true
        }));

        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Failed to mark all as read:', error);
        this.errorMessage = 'Unable to mark all notifications as read.';
      }
    });
  }

  deleteNotification(item: AppNotification): void {
    if (!item?._id) {
      return;
    }

    this.notificationService.deleteNotification(item._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          notification => notification._id !== item._id
        );

        this.unreadCount = this.notifications.filter(
          notification => !notification.isRead
        ).length;
      },
      error: (error) => {
        console.error('Failed to delete notification:', error);
        this.errorMessage = 'Unable to delete this notification.';
      }
    });
  }

  trackById(
    index: number,
    item: AppNotification
  ): string {
    return item._id || index.toString();
  }

  private openAction(item: AppNotification): void {
    const url = item.actionUrl;

    if (url && url.startsWith('/') && !url.startsWith('//')) {
      this.router.navigateByUrl(url).catch(error => {
        console.error('Could not open notification destination:', error);
      });
    }
  }
}
