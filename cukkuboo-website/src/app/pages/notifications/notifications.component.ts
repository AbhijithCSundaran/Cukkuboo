import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  selectedNotification: any = null;

  pageIndex = 0;
  pageSize = 10;
  searchText = '';
  isLoadingDetail = false;
  isMarkingAll = false;

  // Modal
  showDeleteModal = false;
  notificationToDelete: any = null;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    debugger;
    this.notificationService
      .getNotifications(this.pageIndex, this.pageSize, this.searchText).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.notifications = res?.data || [];
            if (this.notifications.length > 0)
              this.selectNotification(this.notifications[0]);

          }
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
        }
      });
  }

  selectNotification(notification: any) {
    this.isLoadingDetail = true;
    this.notificationService.getNotificationById(notification.notification_id).subscribe({
      next: (res: any) => {
        if (res.success) {
          notification.status = 2
          this.selectedNotification = res.data
        }
        this.isLoadingDetail = false;
      },
      error: (err) => {
        console.error('Error loading notification detail:', err);
        this.isLoadingDetail = false;
      }
    });
  }

  markAllAsRead() {
    if (this.isMarkingAll) return;
    this.isMarkingAll = true;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => (n.read = true));
        this.isMarkingAll = false;
        this.snackBar.open('All notifications marked as read.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.isMarkingAll = false;
        this.snackBar.open('Failed to mark all as read.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
        });
      }
    });
  }

  openDeleteModal(notification: any) {
    this.notificationToDelete = notification;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.notificationToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    const notification = this.notificationToDelete;
    if (!notification) return;

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        if (this.selectedNotification?.id === notification.id) {
          this.selectedNotification = null;
        }

        this.snackBar.open('Successfully removed', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });

        this.cancelDelete();
      },
      error: () => {
        this.snackBar.open('Failed to remove', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
        });

        this.cancelDelete();
      }
    });
  }

  onSearch(text: string) {
    this.searchText = text;
    this.pageIndex = 0;
    this.loadNotifications();
  }

  onNextPage() {
    this.pageIndex++;
    this.loadNotifications();
  }

  onPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadNotifications();
    }
  }
}
