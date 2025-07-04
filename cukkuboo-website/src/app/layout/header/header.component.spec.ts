import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  notifications: any[] = [];
  notificationCount: number = 0;

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
      .subscribe(() => this.updateUserInfo());
  }

  ngOnInit(): void {
    this.updateUserInfo();
  }

  updateUserInfo(): void {
    const token = this.storageService.getItem('token');
    this.username = this.storageService.getItem('username');
    this.isSignedIn = !!token;
    if (this.isSignedIn) this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(0, 10).subscribe({
      next: (res) => {
        this.notifications = res?.data || [];
        this.notificationCount = this.notifications.filter((n: any) => n.status === '0').length;
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  goToNotificationsPage(): void {
    this.closeMenu();
    this.router.navigate(['/notifications']);
  }

  signOut(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.storageService.updateItem('token', '');
        this.snackBar.open('Signed out successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/']);
      },
      error: () => {
        this.snackBar.open('Failed to sign out. Please try again.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.showUserDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) this.closeMenu();
  }
}
