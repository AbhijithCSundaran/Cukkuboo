import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<boolean>(); 

  dropdownOpen = false;
  showSidebar = false;
  showLogoutConfirm = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url.split('?')[0].split('#')[0]; 
        // You can use currentRoute if needed
      });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.sidebarToggle.emit(this.showSidebar);
  }

  logout() {
    this.dropdownOpen = false;
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    console.log('Logout confirmation triggered');

    this.userService.logout().subscribe({
      next: (response) => {
        console.log('Logout API success:', response);
        localStorage.clear();
        this.showLogoutConfirm = false;
        this.router.navigate(['/login']);
        this.showSnackbar('Logged out successfully', 'Close', 3000, 'snackbar-success');
      },
      error: (err) => {
        console.error('Logout API error:', err);
        this.showSnackbar('Logout failed. Please try again.', 'Close', 3000, 'snackbar-error');
        this.showLogoutConfirm = false;
      }
    });
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  showSnackbar(message: string, action: string = 'Close', duration: number = 3000, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
