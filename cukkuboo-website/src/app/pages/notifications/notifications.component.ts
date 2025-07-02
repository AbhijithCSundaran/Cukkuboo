import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  notifications = [
    {
      id: 1,
      title: 'New Feature Released',
      message: 'We have released a new feature for premium users.',
      date: new Date(),
      read: false
    },
    {
      id: 2,
      title: 'Maintenance Alert',
      message: 'Scheduled maintenance on Saturday.',
      date: new Date(),
      read: true
    }
  ];

  selectedNotification: any = null;

  get allRead(): boolean {
    return this.notifications.every(n => n.read);
  }

  selectNotification(notification: any) {
    this.selectedNotification = notification;
    if (!notification.read) {
      notification.read = true;
    }
  }

  toggleRead(notification: any) {
    notification.read = !notification.read;
  }

  toggleAllRead() {
    const targetRead = !this.allRead;
    this.notifications.forEach(n => n.read = targetRead);
  }
}
