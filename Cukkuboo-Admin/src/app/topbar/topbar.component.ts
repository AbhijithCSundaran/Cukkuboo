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
       
      });
  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('jwt'); // Clear token
    this.router.navigate(['/login']); // Redirect to login
  }
  
}
