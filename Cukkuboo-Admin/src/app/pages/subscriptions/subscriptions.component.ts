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
  start_date: string;
  end_date: string;
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
    this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
  }

  fetchSubscriptions(pageIndex: number, pageSize: number, searchText: string): void {
    this.userSubscriptionService
      .listUserSubscriptions(pageIndex, pageSize, searchText)
      .subscribe({
        next: (response) => {
          if (response.success) {
            const mappedData: Subscription[] = response.data.map((item: any) => ({
               username: item.username,
              plan_name: item.plan_name,
              start_date: item.start_date,
              end_date: item.end_date,
              status: item.status === '1' ? 'active' : 'expired'
            }));

            this.dataSource.data = mappedData;
            this.totalItems = mappedData.length; // Adjust if API supports paginated total
          } else {
            this.dataSource.data = [];
            this.totalItems = 0;
          }
        },
        error: (error) => {
          console.error('Failed to fetch subscriptions:', error);
          this.dataSource.data = [];
          this.totalItems = 0;
        }
      });
  }
}
