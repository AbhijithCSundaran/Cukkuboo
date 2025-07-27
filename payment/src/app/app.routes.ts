import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./stripe-payment/stripe-payment.component').then((m) => m.StripePaymentComponent) },
    // {component:StripePaymentComponent}
];
