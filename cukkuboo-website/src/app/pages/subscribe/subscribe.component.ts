import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.scss'
})
export class SubscribeComponent implements OnInit {
  plans: any[] = [];
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  stopInfiniteScroll: boolean = false;

  constructor(
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlans(this.pageIndex, this.pageSize, this.searchText);
  }

  loadPlans(pageIndex: number = 0, pageSize: number = 20, search: string = '') {
    this.planService.listPlans(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length) {
            this.plans = [...this.plans, ...res.data];
          } else {
            this.stopInfiniteScroll = true;
          }
        }
      },
      error: (err) => {
        console.error('Error loading plans', err);
        this.snackBar.open('Failed to load plans', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
        });
      }
    });
  }

  subscribeToPlan(planId: number): void {
    if (!planId) {
      this.snackBar.open('Invalid plan ID', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-danger']
      });
      return;
    }

    const model = {
      subscriptionplan_id: planId
    };

    this.subscriptionService.saveSubscription(model).subscribe({
      next: (res) => {
        if (res?.success) {
          this.snackBar.open('Subscription successful!', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open(res?.messages?.error || 'Subscription failed.', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-danger']
          });
        }
      },
      error: (err) => {
        console.error('Subscription error', err);
        this.snackBar.open(err?.error?.messages?.error || 'Something went wrong. Try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
        });
      }
    });
  }
}
