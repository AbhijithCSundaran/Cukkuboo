import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';


interface Notification {
  notification_id: string;
  title: string;
  status: 'read' | 'unread';
  user_id: string;
  username: string; 
  created_on: string;
  type: string;
  target: string;
  is_scheduled: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule 
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'slNo',
    'title',
    // 'username',
    // 'type',
    'target',
    'is_scheduled',
    'created_on',
    // 'status',
     'action'   
  ];
  dataSource = new MatTableDataSource<Notification>([]);
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.fetchNotifications(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.fetchNotifications(this.pageIndex, this.pageSize, this.searchText);
  }

 fetchNotifications(pageIndex: number, pageSize: number, searchText: string): void {
  this.notificationService.getNotifications(pageIndex, pageSize, searchText).subscribe({
    next: (response) => {
      if (response.success) {
        this.dataSource.data = response.data || [];
        this.totalItems = response.total || 0;  
      } else {
        this.dataSource.data = [];
        this.totalItems = 0;
      }
    },
    error: (err) => {
      console.error('Error fetching notifications:', err);
      this.dataSource.data = [];
      this.totalItems = 0;
    }
  });
}


  addNotification(): void {
  console.log('Add new notification clicked');
 
}

editNotification(row: Notification): void {
  console.log('Edit clicked for', row);
 
}
}
