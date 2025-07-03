import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService
      .getNotifications(this.pageIndex, this.pageSize, this.searchText)
      .subscribe({
        next: (res: any) => {
          const rawData = res?.data || [];
          this.notifications = rawData.map((n: any) => ({
            id: n.notification_id,
            title: n.title,
            message: n.content,
            date: new Date(n.created_on),
            read: n.status === '1'
          }));
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
        }
      });
  }

  selectNotification(notification: any) {
    this.isLoadingDetail = true;
    this.notificationService.getNotificationById(notification.id).subscribe((res: any) => {
      const data = res.data;
      this.selectedNotification = {
        id: data.notification_id,
        title: data.title,
        message: data.content,
        date: new Date(data.created_on),
        read: data.status === '1'
      };
      const target = this.notifications.find(n => n.id === this.selectedNotification.id);
      if (target) {
        target.read = true;
      }
      this.isLoadingDetail = false;
    });
  }

  markAsRead(notification: any) {
    notification.read = true;
  }

markAllAsRead() {
  if (this.isMarkingAll) {
    console.log('Already marking all as read, please wait...');
    return;
  }

  console.log('Calling markAllAsRead API...');

  this.isMarkingAll = true;

  this.notificationService.markAllAsRead().subscribe({
    next: (res) => {
      console.log('markAllAsRead API response:', res);

      this.notifications.forEach(n => (n.read = true));
      this.isMarkingAll = false;

      console.log('All notifications marked as read locally.');
    },
    error: (err) => {
      console.error('Failed to mark all as read:', err);
      this.isMarkingAll = false;
    }
  });
}


 deleteNotification(notification: any) {
  console.log('Delete clicked for notification:', notification); 

  const confirmDelete = confirm(`Are you sure you want to delete "${notification.title}"?`);
  if (!confirmDelete) {
    console.log('Delete cancelled by user.');
    return;
  }

  this.notificationService.deleteNotification(notification.id).subscribe({
    next: () => {
      console.log(`Notification with ID ${notification.id} deleted successfully.`);

      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      console.log('Updated notifications list:', this.notifications);

      if (this.selectedNotification?.id === notification.id) {
        console.log('Deleted notification was selected. Clearing selectedNotification.');
        this.selectedNotification = null;
      }
    },
    error: (err) => {
      console.error(`Failed to delete notification with ID ${notification.id}`, err);
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
