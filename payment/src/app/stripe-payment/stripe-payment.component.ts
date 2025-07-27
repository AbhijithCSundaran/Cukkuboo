import { Component } from '@angular/core';
import { StripeService } from '../services/stripe/stripe.service';
import { RevenueCatService } from '../services/revenue-cat/revenue-cat.service';

@Component({
  selector: 'app-stripe-payment',
  imports: [],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.scss'
})
export class StripePaymentComponent {
  public user: any;
  constructor(
    private stripeService: StripeService,
    private revenueCatService: RevenueCatService,
  ) { }

  startSubscription() {
    this.stripeService.subscribe('price_XXXX'); // Replace with actual Stripe price ID
  }

  // async subscribe(packageId: string) {
  //   this.revenueCatService.initRevenueCat(this.user.id); // or token
  //   try {
  //     const res = await this.revenueCatService.purchase(packageId);

  //     // ✅ Payment success
  //     const subscriptionData = {
  //       user_id: this.user.id,
  //       product_id: res?.productIdentifier,
  //       purchase_date: res?.purchaseDate,
  //       platform: 'web',
  //     };

  //     // 🔁 Send to PHP API
  //     // this.http.post('/api/update-subscription.php', subscriptionData).subscribe();

  //   } catch (e) {
  //     console.error("Subscription failed", e);
  //   }
  // }
}
