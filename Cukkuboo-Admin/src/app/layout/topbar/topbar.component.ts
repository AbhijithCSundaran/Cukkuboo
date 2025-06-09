import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url.split('?')[0].split('#')[0]; 
      });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar
    this.sidebarToggle.emit(this.showSidebar);
  }

  logout() {
    this.dropdownOpen = false;
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    localStorage.removeItem('jwt');
    this.showLogoutConfirm = false;
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }
}
