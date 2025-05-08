import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
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
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent {
  displayedColumns: string[] = ['user', 'plan', 'startDate', 'endDate', 'status', 'action'];

  constructor(private router: Router) {}

  dataSource = new MatTableDataSource<Subscription>([
    {
      userName: 'John Doe',
      plan: 'Premium',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      status: 'active'
    },
    {
      userName: 'Jane Smith',
      plan: 'Basic',
      startDate: new Date('2023-05-01'),
      endDate: new Date('2024-05-01'),
      status: 'expired'
    }
  ]);



  editSubscription(sub: any): void {
  
    this.router.navigate(['/edit-subscription-list'], {
  
    });
  }

  deleteSubscription(sub: Subscription) {
    {
      this.dataSource.data = this.dataSource.data.filter(s => s !== sub);
    }
  }
}


