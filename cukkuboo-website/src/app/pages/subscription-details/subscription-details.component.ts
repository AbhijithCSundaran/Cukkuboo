import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { UserService } from '../../services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-subscription-details',
  imports: [
    CommonModule,
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
  ) { }


  ngOnInit(): void {
    const subId = 65;
    this.loadSubscriptionDetails(subId);
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
          console.log('Subscription cancelled successfully.');
          this.subscriptionData.status = '1';
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
