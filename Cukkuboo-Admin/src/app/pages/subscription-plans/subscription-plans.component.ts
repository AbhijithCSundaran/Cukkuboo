import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string | number;
  period: string;          
  features: string;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.scss'
})
export class SubscriptionPlansComponent {

  displayedColumns: string[] = ['slNo','name', 'price', 'period', 'features', 'action'];

  constructor(private router: Router) {}

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 1,
      name: 'Basic',
      price: 10,
      period: 'Monthly',
      features: 'Feature 1, Feature 2'
    },
    {
      id: 2,
      name: 'Standard',
      price: '₹10/month',
      period: 'Monthly', 
      features: 'Access to standard content + 1 screen'
    },
    {
      id: 3,
      name: 'Premium',
      price: '₹15/month',
      period: 'Monthly', 
      features: 'All content + 4 screens + HD'
    }
  ];

  dataSource = new MatTableDataSource<SubscriptionPlan>(this.subscriptionPlans);

  addNewPlan() {
    this.router.navigate(['/add-subscription-plan']);
  }

  editPlan(id: number): void {
    this.router.navigate(['/edit-subscription-plan', id]);
  }

  deletePlan(plan: SubscriptionPlan) {
    const index = this.subscriptionPlans.indexOf(plan);
    if (index >= 0) {
      this.subscriptionPlans.splice(index, 1);
      this.dataSource.data = [...this.subscriptionPlans]; 
    }
  }
}
