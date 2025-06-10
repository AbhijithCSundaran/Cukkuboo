import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


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
    MatInputModule,
    MatFormFieldModule,
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

displayedColumns: string[] = ['slNo', 'plan', 'price', 'period', 'features', 'action'];

  constructor(private router: Router) {}

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 1,
      name: '1 Year',
      price: '₹693',
      period: '365-days',
      features: 'All content + 4 screens + HD'
    },
    {
      id: 2,
      name: '3 Months',
      price: '₹297',
      period: '90-days', 
      features: 'Access to standard content + 2 screen'
    },
    {
      id: 3,
      name: '1 Month',
      price: '₹198',
      period: '30-days', 
      features: 'Access to standard content + 1 screen'
    },

     {
      id: 4,
      name: '3 Days',
      price: '₹99',
      period: '3-days', 
      features: 'Feature 1, Feature 2'
    }
  ];

  dataSource = new MatTableDataSource<SubscriptionPlan>(this.subscriptionPlans);
  ngOnInit(): void {
    


     

  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const dataStr = `${data.name} ${data.role} ${data.email} ${data.phone} ${data.status}`
      .toLowerCase();
    return dataStr.includes(filter);
  };
  }
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
  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.filter = input.trim().toLowerCase();
  }
  
}
