import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { StorageService } from '../../core/services/TempStorage/storageService';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
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
  isMobileView = false;
  hasUnreadNotification: boolean = false;
  userData: any = null;
  isSignedIn: boolean = false;
  username: string = '';


  constructor(
    private storageService: StorageService,

    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.checkScreenWidth();
    window.addEventListener('resize', this.checkScreenWidth.bind(this));
    this.loadNotifications();
    this.checkAuthAndLoadNotifications();
  }

  checkAuthAndLoadNotifications(): void {
    const token = this.storageService.getItem('token');
    this.username = this.storageService.getItem('username');
    this.userData = this.storageService.getItem('userData')
    this.isSignedIn = !!token;
  }
  checkScreenWidth() {
    this.isMobileView = window.innerWidth <= 575
  }


  loadNotifications() {
    this.notificationService
      .getNotifications(this.pageIndex, this.pageSize, this.searchText)
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.notifications = res?.data || [];
            if (this.notifications.length > 0) {
              // this.selectNotification(this.notifications[0]);
            }
          }
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
        }
      });
  }

  selectNotification(notification: any) {
    this.isLoadingDetail = true;
    this.notificationService
      .getNotificationById(notification.notification_id)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            notification.status = 2;
            this.selectedNotification = res.data;
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
        this.notifications.forEach((n) => {
          n.read = true;
          n.status = 2;
        });
        this.userData.notifications = false;
        this.storageService.updateItem('userData', this.userData);
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
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  askToRemoveItem(item: any, index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Are you sure you want to delete <span>"${item?.title}"</span>?</p>`
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmDelete(item, index);
      }
    })
  }

  confirmDelete(item: any, index: number) {
    if (!item) return;
    this.notificationService
      .deleteNotification(item.notification_id).subscribe({
        next: () => {
          this.notifications.splice(index, 1);
          this.snackBar.open('Notification removed successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        },
        error: () => {
          this.snackBar.open('Failed to remove notification', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
          });

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
  getSelectedNotificationIndex(): number {
    return this.notifications.findIndex(
      (n) => n.notification_id === this.selectedNotification?.notification_id
    );
  }
}
