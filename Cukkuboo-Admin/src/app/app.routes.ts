import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddMovieShowComponent } from './pages/add-movie-show/add-movie-show.component';
import { CategoriesComponent } from  './pages/categories/categories.component';
import { GenresComponent } from './pages/genres/genres.component';
import { ListMovieShowComponent } from './pages/list-movie-show/list-movie-show.component';
import { AuthGuard } from './auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AddUserComponent } from './pages/user-list/add-user/add-user.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { EditSubscriptionListComponent } from './pages/subscriptions/edit-subscription-list/edit-subscription-list.component';
import { SubscriptionPlansComponent } from './pages/subscription-plans/subscription-plans.component';
import { AddSubscriptionPlanComponent } from './pages/subscription-plans/add-subscription-plan/add-subscription-plan.component';

export const routes: Routes = [
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',  loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'list-movie-show', component: ListMovieShowComponent },
      { path: 'add-movie-show', component: AddMovieShowComponent },
      { path: 'edit-movie-show/:id', component: AddMovieShowComponent },  // For edit mode
      { path: 'categories', component: CategoriesComponent },
      { path: 'genres', component: GenresComponent },
      {
        path: 'user-list', children: [
          { path: '', component: UserListComponent },
          { path: 'add-user', component: AddUserComponent },
          { path: 'edit-user/:id', component: AddUserComponent },
        ]
      },
      // { path: 'user-list', component: UserListComponent },
      // { path: 'add-user', component: AddUserComponent },
      // { path: 'edit-user/:id', component: AddUserComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
      { path: 'edit-subscription-list', component: EditSubscriptionListComponent },
      { path: 'subscription-plans', component: SubscriptionPlansComponent },
      { path: 'add-subscription-plan', component: AddSubscriptionPlanComponent },
      { path: 'edit-subscription-plan/:id', component: AddSubscriptionPlanComponent },
    ]
  }
];
