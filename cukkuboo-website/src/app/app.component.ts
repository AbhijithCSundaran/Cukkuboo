import { Component, HostListener } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/TempStorage/storageService';
import devtools from 'devtools-detect';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { UserService } from './services/user/user.service';
import { SubscriptionStatus } from './model/enum';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cukkuboo-website';
  isProd: boolean = environment.production;
  devToolIsOpen: boolean = false;
  showloader: boolean = true;
  userLoaded: boolean = true;
  isInitial: boolean = true;
  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private router: Router,
  ) {


    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showloader = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.showloader = false;
          this.isInitial = false;
        }, this.isInitial ? 1000 : 500);
      }
    });
    const token = localStorage.getItem('t_k');
    const name = localStorage.getItem('u_n');
    if (token) {
      this.userLoaded = false;
      this.storageService.updateItem('token', token);
      this.loadUserData();
    }
    if (name)
      this.storageService.updateItem('username', name);

  }
  ngOnInit(): void {
    if (devtools.isOpen)
      this.devToolIsOpen = true;
    window.addEventListener('devtoolschange', (event: any) => {
      // console.log('DevTools changed:', event.detail.isOpen);
      this.devToolIsOpen = true;
    });
    // this.detectDebugger();
  }

  @HostListener('window:devtoolschange', ['$event'])
  onDevToolsChange(event: any) {
    if (event.detail.isOpen) {
      this.devToolIsOpen = true;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    if (!this.isProd) return;
    // event.preventDefault(); // Disable right-click
  }

  @HostListener('window:keydown', ['$event'])
  disableSpecialKeys(event: KeyboardEvent): void {
    if (!this.isProd) return;
    const forbiddenKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
      'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];

    if (
      forbiddenKeys.includes(event.key) || event.ctrlKey || event.altKey) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  detectDebugger() {
    const check = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        this.devToolIsOpen = true;
      }
      setTimeout(check, 1000);
    };
    check();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.storageService.updateItem('userData', response.data);
          this.storageService.updateItem('username', response.data?.username || 'User');
          this.storageService.updateItem('token', response.data?.jwt_token || 'token');
          this.storageService.updateItem('subscription', SubscriptionStatus[Number(response.data?.subscription_details?.subscription) || 0]);
        }
        this.userLoaded = true;
      },

      error: (err) => {
        this.userLoaded = true;

        // const response = {
        //   "success": true,
        //   "message": "Login successful (type 1)",
        //   "data": {
        //     "user_id": "161",
        //     "username": "Bruce Wayne",
        //     "phone": "+917854123625",
        //     "email": "wayne@gmail.com",
        //     "isBlocked": true,
        //     "subscription": "free",
        //     "user_type": "Customer",
        //     "createdAt": "2025-07-11 20:38:19",
        //     "updatedAt": "2025-07-11 18:38:19",
        //     "lastLogin": "2025-07-12 05:20:52",
        //     "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTIyOTc2NTIsImV4cCI6MTc1MjMwMTI1MiwiZGF0YSI6eyJ1c2VyX2lkIjoiMTYxIn19.iLCVw9ZKNza8rXwYZ8gNx3Lioe9xtIlYRVxAgauCh58",
        //     "notifications": 1,
        //     "subscription_details": {
        //       "user_subscription_id": "62",
        //       "subscriptionplan_id": "123",
        //       "plan_name": "Annual Plan ",
        //       "start_date": "2025-07-11",
        //       "end_date": "2026-07-11",
        //       "subscription": "2"
        //     }
        //   }
        // }
        // this.storageService.updateItem('userData', response.data);
        // this.storageService.updateItem('username', response.data?.username || 'User');
        // this.storageService.updateItem('token', response.data?.jwt_token || 'token');
        // this.storageService.updateItem('subscription', SubscriptionStatus[Number(response.data?.subscription_details?.subscription) || 0]);

        console.error('Error fetching profile', err);
      }
    });
  }
}
