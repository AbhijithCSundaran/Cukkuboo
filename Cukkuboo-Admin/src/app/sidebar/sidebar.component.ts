import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

interface SubItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon: string;
  path?: string;
  subItems?: SubItem[];
  showSubmenu?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isCollapsed = false;
  imgUrl:string=environment.imgUrl;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', path: '/dashboard' },
    {
      name: 'Content Management',
      icon: 'fa-film',
      subItems: [
        {name:'List Movie/Show ',path:'/list-movie-show'},
        { name: 'Add Movie/Show', path: '/add-movie-show' },
        { name: 'Manage Content', path: '/manage-content' },
        { name: 'Categories', path: '/categories' },
        { name: 'Genres', path: '/genres' },
        

       
      
      ],
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      subItems: [
        { name: 'Users List', path: '/users' },
        { name: 'Subscriptions', path: '/subscriptions' },
      ],
    },
    { name: 'Reports & Analytics', icon: 'fa-chart-bar', path: '/reports' },
    { name: 'Push Notifications', icon: 'fa-bell', path: '/notifications' },
    { name: 'CMS Settings', icon: 'fa-cogs', path: '/cms-settings' },
    { name: 'Settings', icon: 'fa-sliders-h', path: '/settings' },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
    this.closeAllSubmenus();
  }

  onMenuItemClick(menuItem: MenuItem, event: MouseEvent) {
    event.stopPropagation();
    if (this.isCollapsed) return; 

    menuItem.showSubmenu = !menuItem.showSubmenu;
    this.menuItems.forEach((item) => {
      if (item !== menuItem) item.showSubmenu = false;
    });
  }

  closeAllSubmenus() {
    this.menuItems.forEach((item) => (item.showSubmenu = false));
  }

  onMouseEnter(menuItem: MenuItem) {
    if (this.isCollapsed && menuItem.subItems?.length) {
      menuItem.showSubmenu = true;
    }
  }



  onMouseLeave(menuItem: MenuItem) {
    if (this.isCollapsed && menuItem.subItems?.length) {
      menuItem.showSubmenu = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.menu-item-with-submenu');
    if (!clickedInside && !this.isCollapsed) {
      this.closeAllSubmenus();
    }
  }
}