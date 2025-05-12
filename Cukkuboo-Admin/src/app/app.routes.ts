import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddMovieShowComponent } from './add-movie-show/add-movie-show.component';
import { CategoriesComponent } from './categories/categories.component';
import { GenresComponent } from './genres/genres.component';
import { ListMovieShowComponent } from './list-movie-show/list-movie-show.component';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './user-list/add-user/add-user.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { EditSubscriptionListComponent } from './subscriptions/edit-subscription-list/edit-subscription-list.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { AddSubscriptionPlanComponent } from './subscription-plans/add-subscription-plan/add-subscription-plan.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], 
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'list-movie-show', component: ListMovieShowComponent },
      { path: 'add-movie-show', component: AddMovieShowComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'genres', component: GenresComponent },
      { path: 'user-list', component: UserListComponent },
      { path: 'add-user', component: AddUserComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
      { path: 'edit-subscription-list', component: EditSubscriptionListComponent },
      { path: 'subscription-plans', component: SubscriptionPlansComponent },
      { path: 'add-subscription-plan', component: AddSubscriptionPlanComponent },
    ]
  }
];
