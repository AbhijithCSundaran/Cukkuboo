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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

interface Subscription {
  username: string;
  plan_name: string;
  price: string;
  start_date: string;
  end_date: string;
  status: string; // will be '1', '2', or '3'
}
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = this._to2digit(date.getDate());
      const month = this._to2digit(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return super.format(date, displayFormat);
  }

  private _to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};


@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'user', 'plan', 'price', 'startDate', 'endDate', 'status'];
  dataSource = new MatTableDataSource<Subscription>([]);
  totalItems = 0;
  searchText: string = '';
  pageIndex = 0;
  pageSize = 10;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userSubscriptionService: UserSubscriptionService) { }

  ngOnInit(): void {
    this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
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
    const from = this.fromDate ? this.formatDate(this.fromDate) : '';
    const to = this.toDate ? this.formatDate(this.toDate) : '';

    this.userSubscriptionService
      .listUserSubscriptions(pageIndex, pageSize, searchText, from, to)
      .subscribe({
        next: (response) => {
          if (response.success) {
            const mappedData: Subscription[] = response.data.map((item: any) => ({
              username: item.username,
              plan_name: item.plan_name,
              price: item.price,
              start_date: item.start_date,
              end_date: item.end_date,
              status: item.status // keep raw status value: '1', '2', '3'
            }));

            this.dataSource.data = mappedData;
            this.totalItems = response?.total || 0;
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

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onFromDateChange(event: any) {
    this.fromDate = event.value;
    this.applyDateFilter();
  }

  onToDateChange(event: any) {
    this.toDate = event.value;
    this.applyDateFilter();
  }

  applyDateFilter() {
    this.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.fetchSubscriptions(this.pageIndex, this.pageSize, this.searchText);
  }
}
