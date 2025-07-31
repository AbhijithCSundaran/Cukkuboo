import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeService {
  stripePromise = loadStripe('pk_test_xxx'); // Replace with your Stripe publishable key

  async subscribe(priceId: string) {
    const stripe = await this.stripePromise;
    stripe?.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: 'https://yourdomain.com/subscription-success',
      cancelUrl: 'https://yourdomain.com/subscription-cancel',
    });
  }
}