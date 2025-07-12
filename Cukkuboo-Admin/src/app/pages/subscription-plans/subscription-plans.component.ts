import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PlanService } from '../../services/plan.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface SubscriptionPlan {
  subscriptionplan_id: number;
  plan_name: string;
  price: string | number;
  discount_price?: string | number;
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
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.scss',
})
export class SubscriptionPlansComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'plan_name', 'price', 'discount_price', 'period', 'features', 'action'];
  dataSource = new MatTableDataSource<SubscriptionPlan>([]);
  confirmDeletePlan: SubscriptionPlan | null = null;

  totalItems = 0;
  searchText = '';
  pageIndex = 0;
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private planService: PlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.listPlans(0, this.pageSize, '');
  }

  ngAfterViewInit(): void {
   // this.dataSource.paginator = this.paginator;

    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.listPlans(this.pageIndex, this.pageSize, this.searchText);
    });
  }

 listPlans(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
  this.planService.listPlans(pageIndex, pageSize, search).subscribe({
    next: (response) => {
      console.log('API response from listPlans():', response); 
      this.dataSource.data = response?.data || response || [];
      this.totalItems = response?.total || this.dataSource.data.length;
    },
    error: (error) => {
      console.error('Error fetching plans:', error);
      this.dataSource.data = [];
      this.showSnackbar('Failed to load plans. Please try again.', 'snackbar-error');
    }
  });
}

  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchText = input.trim().toLowerCase();
    this.listPlans(0, this.pageSize, this.searchText);
  }

  addNewPlan(): void {
    this.router.navigate(['/add-subscription-plan']);
  }

  editPlan(id: number): void {
    this.router.navigate(['/edit-subscription-plan', id]);
  }

  deletePlan(plan: SubscriptionPlan): void {
    this.confirmDeletePlan = plan;
  }

  confirmDelete(): void {
    if (!this.confirmDeletePlan) return;

    const id = this.confirmDeletePlan.subscriptionplan_id;

    this.planService.deletePlan(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(p => p.subscriptionplan_id !== id);
        this.showSnackbar('Plan deleted successfully.', 'snackbar-success');
        this.confirmDeletePlan = null;
      },
      error: (error) => {
        console.error('Error deleting plan:', error);
        this.showSnackbar('Failed to delete plan. Please try again.', 'snackbar-error');
        this.confirmDeletePlan = null;
      }
    });
  }

  cancelDelete(): void {
    this.confirmDeletePlan = null;
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
