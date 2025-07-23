import { Component, HostListener } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/TempStorage/storageService';
import devtools from 'devtools-detect';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { UserService } from './services/user/user.service';
import { SubscriptionStatus } from './model/enum';
import { CommonService } from './core/services/common.service';

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
    private commonService: CommonService,
    private userService: UserService,
    private router: Router,
  ) {

    console.log(this.commonService.decryptData('ctybwYg8CiK2p6u0bclvqqWGjCoP2GBkWBpShqSxtEjbXyOAbEcwakcmcPYcDqC5hSFSS9yxlnRFL+6vdEV26gsCXImfoIYutiIiOHuNpSmLUwghoj/QaBBdaZlDCO4O','Abhijith123456789'))

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
        console.error('Error fetching profile', err);
      }
    });
  }
}
