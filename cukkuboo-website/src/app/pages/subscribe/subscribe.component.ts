import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmPlanComponent } from './confirm-plan/confirm-plan.component';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';

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
        // const res = {
        //   "success": true,
        //   "message": "success",
        //   "data": [
        //     {
        //       "subscriptionplan_id": "129",
        //       "plan_name": "neww",
        //       "price": "10000",
        //       "discount_price": "5000",
        //       "period": "1203",
        //       "features": "afdsaafds",
        //       "status": "1",
        //       "created_by": "198",
        //       "created_on": "2025-07-11 18:29:08",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 18:29:15"
        //     },
        //     {
        //       "subscriptionplan_id": "128",
        //       "plan_name": "demo ",
        //       "price": "100",
        //       "discount_price": "99",
        //       "period": "120",
        //       "features": "lorem",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-07-11 11:50:26",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 17:15:51"
        //     },
        //     {
        //       "subscriptionplan_id": "127",
        //       "plan_name": "233",
        //       "price": "5200",
        //       "discount_price": "2000",
        //       "period": "320",
        //       "features": "lorem",
        //       "status": "1",
        //       "created_by": "198",
        //       "created_on": "2025-07-11 11:32:50",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 11:32:50"
        //     },
        //     {
        //       "subscriptionplan_id": "126",
        //       "plan_name": "demo 255",
        //       "price": "1400",
        //       "discount_price": "1300",
        //       "period": "300",
        //       "features": "lorem",
        //       "status": "1",
        //       "created_by": "198",
        //       "created_on": "2025-07-11 11:32:18",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 11:32:18"
        //     },
        //     {
        //       "subscriptionplan_id": "125",
        //       "plan_name": "demo 3",
        //       "price": "4100",
        //       "discount_price": "2500",
        //       "period": "150",
        //       "features": "lorem",
        //       "status": "1",
        //       "created_by": "198",
        //       "created_on": "2025-07-11 11:31:42",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 11:31:42"
        //     },
        //     {
        //       "subscriptionplan_id": "124",
        //       "plan_name": "demo 2",
        //       "price": "1000",
        //       "discount_price": "899",
        //       "period": "10",
        //       "features": "lorem",
        //       "status": "1",
        //       "created_by": "198",
        //       "created_on": "2025-07-11 11:31:15",
        //       "modify_by": "198",
        //       "modify_on": "2025-07-11 11:31:15"
        //     },
        //     {
        //       "subscriptionplan_id": "123",
        //       "plan_name": "Annual Plan ",
        //       "price": "799",
        //       "discount_price": "699",
        //       "period": "365",
        //       "features": "1",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-07-07 07:53:08",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-08 08:27:03"
        //     },
        //     {
        //       "subscriptionplan_id": "120",
        //       "plan_name": "Monthly Plan",
        //       "price": "198",
        //       "discount_price": "189",
        //       "period": "30",
        //       "features": "All-access pass,2 screens,1080p,Light ads",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-06-24 11:19:58",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-03 08:55:12"
        //     },
        //     {
        //       "subscriptionplan_id": "119",
        //       "plan_name": "Short Term Plan",
        //       "price": "179",
        //       "discount_price": "126",
        //       "period": "10",
        //       "features": "1 screen,1080p HD,Limited ads,Verified student email required",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-06-24 11:18:21",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-03 08:58:53"
        //     },
        //     {
        //       "subscriptionplan_id": "118",
        //       "plan_name": "Mini Plan",
        //       "price": "129",
        //       "discount_price": "99",
        //       "period": "4",
        //       "features": "1 device",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-06-24 11:16:02",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-03 08:57:28"
        //     },
        //     {
        //       "subscriptionplan_id": "117",
        //       "plan_name": "Daily Plan",
        //       "price": "99",
        //       "discount_price": "49",
        //       "period": "1",
        //       "features": "1 day",
        //       "status": "1",
        //       "created_by": "29",
        //       "created_on": "2025-06-24 11:14:04",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-03 08:58:16"
        //     },
        //     {
        //       "subscriptionplan_id": "76",
        //       "plan_name": "3 days",
        //       "price": "199",
        //       "discount_price": "99",
        //       "period": "3",
        //       "features": "4k quality and use the account upto 6 devices",
        //       "status": "1",
        //       "created_by": "126",
        //       "created_on": "2025-06-20 05:56:30",
        //       "modify_by": "29",
        //       "modify_on": "2025-07-07 07:52:30"
        //     }
        //   ],
        //   "total": 12
        // }
        // this.plans = [...this.plans, ...res.data];
        // if (this.plans.length > res.total)
        //   this.stopInfiniteScroll = true;
      }
    });
  }



  askToSubscribe(plan: any) {
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
