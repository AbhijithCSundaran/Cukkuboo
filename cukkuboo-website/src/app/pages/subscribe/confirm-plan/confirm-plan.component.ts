import { CommonModule, Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { SubscriptionService } from '../../../services/subscription.service';

@Component({
  selector: 'app-confirm-plan',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './confirm-plan.component.html',
  styleUrl: './confirm-plan.component.scss'
})
export class ConfirmPlanComponent {
  acknowledged: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private location: Location,
    private subscriptionService: SubscriptionService,
  ) {
  }
  // confirm(): void {
  //   if (!this.acknowledged) {
  //     this.snackBar.open('Please read and acknowledge our Privacy Policy & Terms of Use.', '', {
  //       duration: 3000,
  //       verticalPosition: 'top',
  //       horizontalPosition: 'center',
  //       panelClass: ['snackbar-warn']
  //     });
  //   }
  //   else
  //     this.dialogRef.close(true);
  // }
confirm() {
  if (!this.acknowledged) {
    this.snackBar.open(
      'Please read and acknowledge our Privacy Policy & Terms of Use.',
      '',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-warn']
      }
    );
    return; // Stop further execution
  }

  // Proceed only if plan and stripe price ID are available
  if (!this.data?.plan?.stripe_price_id) {
    console.error('Stripe price ID is missing.');
    return;
  }
// confirm() {
//   if (!this.data?.plan?.stripe_price_id) {
//     console.error('Stripe price ID is missing.');
//     return;
//   }

  this.subscriptionService.createStripeCheckout(this.data.plan.stripe_price_id)
    .subscribe({
      next: (res) => {
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
        } else {
          console.error('Invalid response from server');
        }
      },
      error: (err) => {
        console.error('Stripe Checkout session error:', err);
      }
    });
}


  getLink(route: string): string {
    const fullUrl = window.location.href
    const target = fullUrl.replace('subscribe', route);
    return target;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
