import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'signin', loadComponent: () => import('./pages/sign-in/sign-in.component').then((m) => m.SignInComponent) },
    { path: 'signup', loadComponent: () => import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent) },
    { path: 'reels', loadComponent: () => import('./pages/reels/reels.component').then(m => m.ReelsComponent) },

    // {path: '', component:AboutUsComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                children: [
                    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
                    { path: 'about-us', loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent) },
                    { path: 'movies', loadComponent: () => import('./pages/movies/movies.component').then(m => m.MoviesComponent) },
                    { path: 'movies/:id', loadComponent: () => import('./pages/movies/single-movie/single-movie.component').then(m => m.SingleMovieComponent) },
                    { path: 'subscribe', loadComponent: () => import('./pages/subscribe/subscribe.component').then(m => m.SubscribeComponent) },
                    { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
                    { path: 'terms-of-use', loadComponent: () => import('./pages/terms-of-use/terms-of-use.component').then(m => m.TermsOfUseComponent) },
                    { path: 'help-center', loadComponent: () => import('./pages/help-center/help-center.component').then(m => m.HelpCenterComponent) },
                    { path: 'success/:id', loadComponent: () => import('./pages/success-payment/success-payment.component').then((m) => m.SuccessPaymentComponent) },
                    { path: 'failed/:id', loadComponent: () => import('./pages/failed-payment/failed-payment.component').then((m) => m.FailedPaymentComponent) },
                    // { path: 'contact-us', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent) }
                ]
            },
            {
                path: '',
                canActivate: [authGuard],
                children: [
                    { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
                    { path: 'watch-later', loadComponent: () => import('./pages/watch-later/watch-later.component').then(m => m.WatchLaterComponent) },
                    { path: 'history', loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent) },
                    { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
                    { path: 'subscription-details', loadComponent: () => import('./pages/subscription-details/subscription-details.component').then(m => m.SubscriptionDetailsComponent) },
                ]
            },
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }

];
