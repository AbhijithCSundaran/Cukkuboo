import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { UserService } from '../../services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { ContentLoaderComponent } from '../../core/components/content-loader/content-loader.component';

@Component({
  selector: 'app-subscription-details',
  imports: [
    CommonModule, ContentLoaderComponent
  ],
  templateUrl: './subscription-details.component.html',
  styleUrl: './subscription-details.component.scss'
})
export class SubscriptionDetailsComponent implements OnInit {
  subscriptionData: any;
  constructor(private userService: UserService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) { }


  ngOnInit(): void {
    const data = this.storageService.getItem('userData');
    if (data?.subscription_details?.user_subscription_id)
      this.loadSubscriptionDetails(data?.subscription_details?.user_subscription_id);
    else
      this.router.navigate(['/']);
  }

  loadSubscriptionDetails(subId: number): void {
    this.userService.getSubscriptionPlanByuserId(subId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.subscriptionData = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching subscription:', err);
      }
    });
  }

  askToConfirm() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Are you sure you want to cancel <span> Subscription</span>?</p>`
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cancelSubscription();
      }
    })
  }

  cancelSubscription(): void {
    this.userService.cancelSubscriptionPlan().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.subscriptionData = null;
          const userData = this.storageService.getItem('userData');
          userData.subscription_details.subscription = 3;
          this.storageService.updateItem('userData', userData);
          this.snackBar.open('Subscription cancelled successfully.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        }
      },
      error: (err) => {
        console.error('Error cancelling subscription:', err);
        this.snackBar.open('Failed to cancel subscription. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });

  }
}
