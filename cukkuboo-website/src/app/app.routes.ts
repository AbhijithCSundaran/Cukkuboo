import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'signin', loadComponent: () => import('./pages/sign-in/sign-in.component').then((m) => m.SignInComponent) },
    { path: 'signup', loadComponent: () => import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent) },
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
                    { path: 'reels', loadComponent: () => import('./pages/reels/reels.component').then(m => m.ReelsComponent) },

                    // { path: 'contact-us', loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent) }
                ]
            },
            {
                path: '',
                canActivate: [authGuard],
                children: [
                    { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) }
                ]
            },
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }

];
