import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isCollapsed = false;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  @Output() itemSelected = new EventEmitter<void>();


  isMobileView = window.innerWidth <= 1024;

@HostListener('window:resize', ['$event'])
onResize(event: any) {
  this.isMobileView = event.target.innerWidth <= 1024;
}


  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', path: '/dashboard' },
    {
      name: 'Content Management',
      icon: 'fa-film',
      subItems: [
        {name:'List Movie/Show ',path:'/list-movie-show'},
     
        { name: 'Categories', path: '/categories' },
        { name: 'Genres', path: '/genres' },
        { name: 'Reels', path: '/reels' }
        

       
      
      ],
    },
    {
      name: 'User Management',
      icon: 'fa-users',
      subItems: [
        { name: 'Users List', path: '/user-list' },
        { name: 'Subscriptions', path: '/subscriptions' },
      ],
    },
    {
      name: 'Staff Management',
      icon: 'fa fa-user-cog',
      subItems: [
        { name: 'Staff List', path: '/staff-list' },
      ],
    },
    { name: 'Reports & Analytics', icon: 'fa-chart-bar', path: '/reports' },
    { name: 'Push Notifications', icon: 'fa-bell', path: '/notifications' },
    { name: 'Settings', icon: 'fa-sliders-h', subItems: [
      { name: 'Subscription Plans', path: '/subscription-plans' },
     
    ], },
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
  onSubItemClick() {
    this.closeAllSubmenus();
    this.itemSelected.emit();
  }
  
}