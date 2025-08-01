import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmPlanComponent } from './confirm-plan/confirm-plan.component';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';
import { SignInComponent } from '../sign-in/sign-in.component';



@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, RouterModule,
    InfiniteScrollDirective
  ],
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

  constructor(
    // private planService: PlanService,
    private storageService: StorageService,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadPlans();
    this.storageService.onUpdateItem.subscribe(() => {
      this.UserData = this.storageService.getItem('userData');
    });
  }
  onScroll(event: any) {
    this.pageIndex++;
    this.loadPlans();
  }

  loadPlans(): void {
    this.subscriptionService.listPlans(this.pageIndex, this.pageSize, this.searchText).subscribe({
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
       
      }
    });
  }

  openLoginModal() {
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'subscribe',
      width: 'auto', height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
      this.dialog.closeAll();
    });
  }

  askToSubscribe(plan: any) {
    if (!this.UserData) {
      this.openLoginModal();
      return;
    }
    if (this.UserData?.subscription_details?.subscription == 1) {
      this.snackBar.open('You are already subscribed to a plan.', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-warn']
      });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmPlanComponent, {
      data: {
        plan: plan,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmSubscription(plan);
      }
    })
  }

  confirmSubscription(plan: any): void {
    if (!plan?.subscriptionplan_id) {
      this.snackBar.open('Invalid plan selected', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const model = {
      subscriptionplan_id: plan.subscriptionplan_id
    };

    this.subscriptionService.saveSubscription(model).subscribe({
      next: (res) => {
        if (res.success) {
          this.UserData.subscription = 'Premium';
          res.data.subscription = res.data?.status | 1;
          this.UserData.subscription_details = res.data;
          this.storageService.updateItem('userData', this.UserData);
          this.router.navigate(['/subscription-details'])
        }
        this.snackBar.open(res?.success ? 'Subscription activated successfully.' : res?.messages?.error || 'Subscription failed.', '',
          {
            duration: 3000, verticalPosition: 'top', horizontalPosition: 'center',
            panelClass: [res?.success ? 'snackbar-success' : 'snackbar-error']
          }
        );
      },
      error: (err) => {
        this.snackBar.open(err?.error?.messages?.error || 'Something went wrong. Try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    });
  }
  
}
