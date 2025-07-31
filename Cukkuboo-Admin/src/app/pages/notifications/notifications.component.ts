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

interface Notification {
  notification_id: string;
  title: string;
  content: string;
  status: 'read' | 'unread';
  user_id: string;
  username: string; 
  created_on: string;
  expanded?: boolean;
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
    MatIconModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'title', 'content', 'username', 'created_on', 'status'];
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
      next: (res) => {
        if (res.success) {
          const mappedData: Notification[] = res.data.map((item: any) => ({
            notification_id: item.notification_id,
            title: item.title,
            content: item.content,
            status: item.status === '1' ? 'read' : 'unread',
            user_id: item.user_id,
            username: item.username || 'Unknown', // fallback if not present
            created_on: item.created_on,
            expanded: false
          }));

          this.dataSource.data = mappedData;
          this.totalItems = res.total || mappedData.length;
        } else {
          this.dataSource.data = [];
          this.totalItems = 0;
        }
      },
      error: (err) => {
        console.error('Failed to fetch notifications', err);
        this.dataSource.data = [];
        this.totalItems = 0;
      }
    });
  }

  toggleContent(row: Notification): void {
    row.expanded = !row.expanded;
  }
}
