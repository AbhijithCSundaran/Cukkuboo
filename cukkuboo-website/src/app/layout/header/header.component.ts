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
    this.storageService.onUpdateItem.subscribe(() => {
      this.checkAuthAndLoadNotifications();
    });
  }

  ngOnInit(): void {
    this.checkAuthAndLoadNotifications();
  }

  checkAuthAndLoadNotifications(): void {
    const token = this.storageService.getItem('token');
    this.username = this.storageService.getItem('username');
    this.userData = this.storageService.getItem('userData')
    this.isSignedIn = !!token;
    if (this.userData?.notifications)
      this.hasUnreadNotification = true;
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



  askToSignout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to <b>sign out</b>?` },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmSignOut();
      }
    })
  }
  confirmSignOut(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.storageService.updateItem('token', '');
        this.storageService.updateItem('userData', null);
        this.storageService.updateItem('username', '');
        this.storageService.updateItem('subscription', '');
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
   goToSubscribe(): void {
    this.router.navigate(['/subscribe'], { queryParams: { source: 'header' } });
  }
}
