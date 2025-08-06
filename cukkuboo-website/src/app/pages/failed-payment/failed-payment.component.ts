import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-failed-payment',
  imports: [],
  templateUrl: './failed-payment.component.html',
  styleUrl: './failed-payment.component.scss'
})
export class FailedPaymentComponent implements OnInit{
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
      this.subscriptionService.updatePaymentFailed(UsersubId).subscribe({
        next: (res) => {
          this.message = res?.message || 'Subscription Failed!';
          setTimeout(() => {
            this.router.navigate(['/subscription-details']);
          }, 5000);
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
