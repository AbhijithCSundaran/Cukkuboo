import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';

interface SubscriptionPlan {
  name: string;
  price: string;
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
  displayedColumns: string[] = ['name', 'price', 'features', 'action'];

  constructor(private router: Router) {}

  subscriptionPlans: SubscriptionPlan[] = [
    { name: 'Basic', price: '₹5/month', features: 'Access to limited content' },
    { name: 'Standard', price: '₹10/month', features: 'Access to standard content + 1 screen' },
    { name: 'Premium', price: '₹15/month', features: 'All content + 4 screens + HD' }
  ];

  // MatTableDataSource used by <table mat-table>
  dataSource = new MatTableDataSource<SubscriptionPlan>(this.subscriptionPlans);

  addNewPlan() {
   
      this.router.navigate(['/add-subscription-plan']);
   
    
  }

  editPlan(plan: SubscriptionPlan) {
    this.router.navigate(['/add-subscription-plan']);
   
  }

  deletePlan(plan: SubscriptionPlan) {
    const index = this.subscriptionPlans.indexOf(plan);
    if (index >= 0) {
      this.subscriptionPlans.splice(index, 1);
      this.dataSource.data = [...this.subscriptionPlans]; // Refresh table
    }
  }
}
