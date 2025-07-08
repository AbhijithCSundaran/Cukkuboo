import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  username: string = '';
  isSignedIn: boolean = false;
  showUserDropdown: boolean = false;
  subscription: string = '';

  notifications: any[] = [];
  hasUnreadNotification: boolean = true;

  showSignOutModal: boolean = false;

  private _menuOpen = false;
  get menuOpen(): boolean {
    return this._menuOpen;
  }
  set menuOpen(value: boolean) {
    this._menuOpen = value;
    document.body.classList.toggle('sidebar-open', value);
  }

  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.storageService.onUpdateItem
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => this.checkAuthAndLoadNotifications());
  }

  ngOnInit(): void {
    this.checkAuthAndLoadNotifications();
  }

  checkAuthAndLoadNotifications(): void {
    const token = this.storageService.getItem('token');
    this.username = this.storageService.getItem('username');
    this.subscription = (this.storageService.getItem('subscription') || '').toLowerCase();
    this.isSignedIn = !!token;
  }

  goToNotifications(): void {
    // this.closeMenu();
        this.router.navigate(['/notifications']);
        this.hasUnreadNotification = false;

    // this.notificationService.markAllAsRead().subscribe({
    //   next: () => {
    //     this.hasUnreadNotification = false;
    //   },
    //   error: (err) => {
    //     console.error('Failed to mark notifications as read', err);
    //     this.router.navigate(['/notifications']);
    //   }
    // });
  }

 
  openSignOutModal(): void {
    this.showSignOutModal = true;
  }

  cancelSignOut(): void {
    this.showSignOutModal = false;
  }

  confirmSignOut(): void {
    this.showSignOutModal = false;

    this.userService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.storageService.updateItem('token', '');
        this.snackBar.open('Signed out successfully', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.snackBar.open('Failed to sign out. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  closeMenu() {
    this.menuOpen = false;
    this.showUserDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closeMenu();
    }
  }
}
