import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'list-movie-show', loadComponent: () => import('./pages/list-movie-show/list-movie-show.component').then((m) => m.ListMovieShowComponent) },
      { path: 'add-movie-show', loadComponent: () => import('./pages/list-movie-show/add-movie-show/add-movie-show.component').then((m) => m.AddMovieShowComponent) },
      {
        path: 'edit-movie-show/:id',
        loadComponent: () => import('./pages/list-movie-show/add-movie-show/add-movie-show.component').then(m => m.AddMovieShowComponent)
      },
      { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then((m) => m.CategoriesComponent) },
      { path: 'genres', loadComponent: () => import('./pages/genres/genres.component').then((m) => m.GenresComponent) },
      { path: 'reels', loadComponent: () => import('./pages/list-reels/list-reels.component').then((m) => m.ListReelsComponent) },
      { path: 'add-reels', loadComponent: () => import('./pages/list-reels/add-reels/add-reels.component').then((m) => m.AddReelsComponent) },
      { path: 'edit-reel/:id', loadComponent: () => import('./pages/list-reels/add-reels/add-reels.component').then(m => m.AddReelsComponent) },
      // { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then((m) => m.NotificationsComponent) },
      { path: 'tickets', loadComponent: () => import('./pages/tickets/tickets.component').then((m) => m.TicketsComponent) },
      { path: 'edit-ticket/:id', loadComponent: () => import('./pages/tickets/edit-tickets/edit-tickets.component').then((m) => m.EditTicketsComponent) },
      // { path: 'list-policies', loadComponent: () => import('./pages/list-policies/list-policies.component').then((m) => m.ListPoliciesComponent) },

      // { path: 'edit-policy/:id', loadComponent: () => import('./pages/list-policies/edit-policy/edit-policy.component').then((m) => m.EditPolicyComponent) },
      
      //  {
      //         path: 'reels', children: [
      //           { path: '', loadComponent: () => import('./pages/list-reels/list-reels.component').then((m) => m.ListReelsComponent)},
      //           { path: 'add-reels', loadComponent: () => import('./pages/list-reels/add-reels/add-reels.component').then((m) => m.AddReelsComponent) },
      //           { path: 'edit-reels/:id', loadComponent: () => import('./pages/list-reels/add-reels/add-reels.component').then((m) => m.AddReelsComponent) },
      //         ]
      //       },


      {
        path: 'user-list', children: [
          { path: '', loadComponent: () => import('./pages/user-list/user-list.component').then((m) => m.UserListComponent) },
          { path: 'add-user', loadComponent: () => import('./pages/user-list/add-user/add-user.component').then((m) => m.AddUserComponent) },
          { path: 'edit-user/:id', loadComponent: () => import('./pages/user-list/add-user/add-user.component').then((m) => m.AddUserComponent) },
        ]
      },
      {
        path: 'staff-list', children: [
          { path: '', loadComponent: () => import('./pages/staff-list/staff-list.component').then((m) => m.StaffListComponent) },
          { path: 'add-staff', loadComponent: () => import('./pages/staff-list/add-staff/add-staff.component').then((m) => m.AddStaffComponent) },
          { path: 'edit-staff/:id', loadComponent: () => import('./pages/staff-list/add-staff/add-staff.component').then((m) => m.AddStaffComponent) },
        ]
      },
      // { path: 'user-list', loadComponent: () => import('./pages/user-list/user-list.component').then((m) => m.UserListComponent) },
      // { path: 'add-user', loadComponent: () => import('./pages/user-list/add-user/add-user.component').then((m) => m.AddUserComponent) },
      // { path: 'edit-user/:id', loadComponent: () => import('./pages/user-list/add-user/add-user.component').then((m) => m.AddUserComponent) },
      { path: 'subscriptions', loadComponent: () => import('./pages/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent) },
      { path: 'edit-subscription-list', loadComponent: () => import('./pages/subscriptions/edit-subscription-list/edit-subscription-list.component').then((m) => m.EditSubscriptionListComponent) },
      { path: 'subscription-plans', loadComponent: () => import('./pages/subscription-plans/subscription-plans.component').then((m) => m.SubscriptionPlansComponent) },
      { path: 'add-subscription-plan', loadComponent: () => import('./pages/subscription-plans/add-subscription-plan/add-subscription-plan.component').then((m) => m.AddSubscriptionPlanComponent) },
      { path: 'edit-subscription-plan/:id', loadComponent: () => import('./pages/subscription-plans/add-subscription-plan/add-subscription-plan.component').then((m) => m.AddSubscriptionPlanComponent) },
    ]
  }
];
