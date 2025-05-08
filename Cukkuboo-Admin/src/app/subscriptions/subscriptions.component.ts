import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';

interface Subscription {
  userName: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements AfterViewInit {
  displayedColumns: string[] = ['user', 'plan', 'startDate', 'endDate', 'status', 'action'];
  
  dataSource = new MatTableDataSource<Subscription>([
    { userName: 'John Doe', plan: 'Premium', startDate: new Date('2024-01-01'), endDate: new Date('2025-01-01'), status: 'active' },
    { userName: 'Jane Smith', plan: 'Basic', startDate: new Date('2023-05-01'), endDate: new Date('2024-05-01'), status: 'expired' },
    { userName: 'Alice Johnson', plan: 'Standard', startDate: new Date('2024-02-10'), endDate: new Date('2025-02-10'), status: 'active' },
    { userName: 'Bob Martin', plan: 'Premium', startDate: new Date('2023-11-01'), endDate: new Date('2024-11-01'), status: 'expired' },
    { userName: 'Charlie Brown', plan: 'Basic', startDate: new Date('2023-12-15'), endDate: new Date('2024-12-15'), status: 'active' },
    { userName: 'Diana Prince', plan: 'Standard', startDate: new Date('2024-03-20'), endDate: new Date('2025-03-20'), status: 'active' },
    { userName: 'Evan Scott', plan: 'Basic', startDate: new Date('2023-08-01'), endDate: new Date('2024-08-01'), status: 'expired' },
    { userName: 'Fiona Apple', plan: 'Premium', startDate: new Date('2024-04-01'), endDate: new Date('2025-04-01'), status: 'active' },
    { userName: 'George King', plan: 'Standard', startDate: new Date('2023-10-10'), endDate: new Date('2024-10-10'), status: 'expired' },
    { userName: 'Helen Lane', plan: 'Basic', startDate: new Date('2023-07-01'), endDate: new Date('2024-07-01'), status: 'expired' },
    { userName: 'Isaac Newton', plan: 'Premium', startDate: new Date('2024-05-01'), endDate: new Date('2025-05-01'), status: 'active' },
    { userName: 'Julia Roberts', plan: 'Standard', startDate: new Date('2024-06-01'), endDate: new Date('2025-06-01'), status: 'active' },
    { userName: 'Kevin Hart', plan: 'Basic', startDate: new Date('2023-09-15'), endDate: new Date('2024-09-15'), status: 'expired' },
    { userName: 'Laura Palmer', plan: 'Premium', startDate: new Date('2024-07-01'), endDate: new Date('2025-07-01'), status: 'active' },
    { userName: 'Michael Scott', plan: 'Standard', startDate: new Date('2023-11-20'), endDate: new Date('2024-11-20'), status: 'expired' },
    { userName: 'Nancy Drew', plan: 'Basic', startDate: new Date('2024-01-15'), endDate: new Date('2025-01-15'), status: 'active' },
    { userName: 'Oscar Wilde', plan: 'Premium', startDate: new Date('2024-02-01'), endDate: new Date('2025-02-01'), status: 'active' },
    { userName: 'Pam Beesly', plan: 'Standard', startDate: new Date('2023-10-01'), endDate: new Date('2024-10-01'), status: 'expired' },
    { userName: 'Quentin Blake', plan: 'Basic', startDate: new Date('2023-06-10'), endDate: new Date('2024-06-10'), status: 'expired' },
    { userName: 'Rachel Green', plan: 'Premium', startDate: new Date('2024-03-01'), endDate: new Date('2025-03-01'), status: 'active' },
    { userName: 'Steve Rogers', plan: 'Standard', startDate: new Date('2023-12-01'), endDate: new Date('2024-12-01'), status: 'expired' },
    { userName: 'Tony Stark', plan: 'Premium', startDate: new Date('2024-08-01'), endDate: new Date('2025-08-01'), status: 'active' },
    { userName: 'Uma Thurman', plan: 'Basic', startDate: new Date('2023-04-01'), endDate: new Date('2024-04-01'), status: 'expired' },
    { userName: 'Victor Hugo', plan: 'Standard', startDate: new Date('2023-09-01'), endDate: new Date('2024-09-01'), status: 'expired' },
    { userName: 'Wanda Maximoff', plan: 'Premium', startDate: new Date('2024-09-01'), endDate: new Date('2025-09-01'), status: 'active' }
  ]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  editSubscription(sub: Subscription): void {
    this.router.navigate(['/edit-subscription-list']);
  }

  deleteSubscription(sub: Subscription): void {
    this.dataSource.data = this.dataSource.data.filter(s => s !== sub);
  }
}
