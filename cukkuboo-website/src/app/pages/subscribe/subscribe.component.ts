import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { StorageService } from '../../core/services/TempStorage/storageService';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, RouterModule],
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
  plans: any[] = [];
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  searchText = '';
  stopInfiniteScroll = false;
  UserData: any;

  // Modal controls
  showSubscriptionModal = false;
  selectedPlan: any = null;

  // Checkbox acknowledgment
  acknowledged: boolean = false;

  constructor(
    private planService: PlanService,
    private storageService: StorageService,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPlans();
    this.storageService.onUpdateItem.subscribe(() => {
      this.UserData = this.storageService.getItem('userData');
    });
  }

  loadPlans(): void {
    this.planService.listPlans(this.pageIndex, this.pageSize, this.searchText).subscribe({
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

  subscribeToPlan(plan: any): void {
    if (this.UserData?.subscription == 'free') {

      this.selectedPlan = plan;
      this.acknowledged = false;
      this.showSubscriptionModal = true;
    }
    else {
      this.snackBar.open('You are already a subscriber.', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-warn']
      });
    }
  }

  closeSubscriptionModal(): void {
    this.showSubscriptionModal = false;
    this.selectedPlan = null;
    this.acknowledged = false;
  }

  confirmSubscription(): void {
    if (!this.selectedPlan?.subscriptionplan_id) {
      this.snackBar.open('Invalid plan selected', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-danger']
      });
      return;
    }

    const model = {
      subscriptionplan_id: this.selectedPlan.subscriptionplan_id
    };

    this.subscriptionService.saveSubscription(model).subscribe({
      next: (res) => {
        if(res.success){
          this.UserData.subscription = 'premium';
           this.storageService.updateItem('userData',this.UserData);
          this.showSubscriptionModal = false;
          this.selectedPlan = null;
          this.acknowledged = false;
  
          this.snackBar.open(
            res?.success ? 'Subscription successful!' : res?.messages?.error || 'Subscription failed.',
            '',
            {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: [res?.success ? 'snackbar-success' : 'snackbar-danger']
            }
          );
        }
      },
      error: (err) => {
        this.showSubscriptionModal = false;
        this.selectedPlan = null;
        this.acknowledged = false;

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
