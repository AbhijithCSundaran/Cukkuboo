import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-success-payment',
  imports: [],
  templateUrl: './success-payment.component.html',
  styleUrl: './success-payment.component.scss'
})
export class SuccessPaymentComponent implements OnInit {
  message: string = '';


  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id)
        this.UpdateStatus(id);
    });
  }

  ngOnInit(): void {

  }
  UpdateStatus(UsersubId: number) {

    if (UsersubId) {
      this.subscriptionService.updatePaymentSuccess(UsersubId).subscribe({
        next: (res) => {
          this.message = res?.message || 'Subscription successfully marked as paid!';
          // setTimeout(() => {
          //   // const currentUrl = window.location.href;
          //   // const updatedUrl = currentUrl.replace(/#\/.*/, '#/');
          //   // window.location.href = updatedUrl+'subscription-details';
          //   window.location.reload();
          // }, 5000);
        },
        error: (err) => {
          this.message = err?.error?.messages?.error || 'Something went wrong during payment processing.';
        }
      });
    } else {
      this.message = 'Missing subscription ID.';
    }
  }


}


