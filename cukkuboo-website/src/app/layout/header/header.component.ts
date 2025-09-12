import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user/user.service';
import { NotificationService } from '../../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';

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
  userData: any = null;

  notifications: any[] = [];
  hasUnreadNotification: boolean = false;

  private _menuOpen = false;
  get menuOpen(): boolean {
    return this._menuOpen;
  }
  set menuOpen(value: boolean) {
    this._menuOpen = value;
    // Toggle body class when sidebar/menu is opened or closed
    document.body.classList.toggle('sidebar-open', value);
  }

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    // Listen for storage updates (e.g., login/logout changes)
    this.storageService.onUpdateItem.subscribe(() => {
      this.checkAuthAndLoadNotifications();
    });
  }

  ngOnInit(): void {
    // Check authentication status and preload notifications
    this.checkAuthAndLoadNotifications();
  }

  checkAuthAndLoadNotifications(): void {
    // Get stored authentication details
    const token = this.storageService.getItem('token');
    this.username = this.storageService.getItem('username');
    this.userData = this.storageService.getItem('userData');
    this.isSignedIn = !!token;

    // Show notification badge if user has unread notifications
    if (this.userData?.notifications && !this.router.url.includes('notifications'))
      this.hasUnreadNotification = true;
  }

  goToNotifications(): void {
    // Navigate to notifications page
    this.router.navigate(['/notifications']);
    this.hasUnreadNotification = false;

    // (Optional) API call to mark all notifications as read
    // this.notificationService.markAllAsRead()...
  }

  askToSignout() {
    // Open confirmation dialog before signing out
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to <b>sign out</b>?` },
    });

    // If user confirms, proceed with sign out
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmSignOut();
      }
    });
  }

  confirmSignOut(): void {
    // Call logout API from UserService
    this.userService.logout().subscribe({
      next: () => {
        // Clear all local storage/session data
        localStorage.clear();
        this.storageService.updateItem('token', '');
        this.storageService.updateItem('userData', null);
        this.storageService.updateItem('username', '');
        this.storageService.updateItem('subscription', '');

        // Show success snackbar
        this.snackBar.open('Signed out successfully', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });

        // Redirect to home page
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout failed:', err);

        // Show error snackbar if logout fails
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
    // Close sidebar and user dropdown
    this.menuOpen = false;
    this.showUserDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Detect clicks outside header to close menus/dropdowns
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closeMenu();
    }
  }

  goToSubscribe(): void {
    // Navigate to subscription page with query param for tracking
    this.router.navigate(['/subscribe'], { queryParams: { source: 'header' } });
  }
}
