import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UserSubscriptionService } from '../../services/subscription.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

interface Subscription {
  username: string;
  plan_name: string;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired';
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'user', 'plan', 'startDate', 'endDate', 'status'];
  dataSource = new MatTableDataSource<Subscription>([]);
  totalItems = 0;
  searchText: string = '';
  pageIndex = 0;
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userSubscriptionService: UserSubscriptionService) {}

  ngOnInit(): void {
    this.fetchSubscriptions(0, this.pageSize, '');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  fetchSubscriptions(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): void {
    this.userSubscriptionService.listUserSubscriptions(pageIndex, pageSize, searchText).subscribe({
      next: (response) => {
        console.log('Subscriptions response:', response);

        this.dataSource.data = response?.data || [];
        this.totalItems = response?.totalCount || this.dataSource.data.length;

        // Force refresh paginator length (needed if response.totalCount is updated)
        if (this.paginator) {
          this.paginator.length = this.totalItems;
        }
      },
      error: (error) => {
        console.error('Error fetching subscriptions:', error);
      }
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.paginator.pageIndex = 0;
    this.fetchSubscriptions(0, this.pageSize, this.searchText);
  }
}
