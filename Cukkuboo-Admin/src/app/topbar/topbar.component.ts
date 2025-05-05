import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  dropdownOpen = false;
  currentPageTitle = 'Dashboard'; 

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url.split('?')[0].split('#')[0]; 
        this.currentPageTitle = this.getPageTitle(currentRoute);
      });
  }

  getPageTitle(route: string): string {
  
    route = route.endsWith('/') && route.length > 1 ? route.slice(0, -1) : route;

    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/content-management': 'Content Management',
      '/user-management': 'User Management',
      '/reports': 'Reports & Analytics',
      '/notifications': 'Push Notifications',
      '/cms-settings': 'CMS Settings',
      '/settings': 'Settings',
      '/': 'Dashboard'
    };

    return routeMap[route] || this.extractTitleFromRoute(route);
  }

  extractTitleFromRoute(route: string): string {
    
    const parts = route.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    const formatted = parts[0].replace(/-/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}
