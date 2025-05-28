import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';
import { TopbarComponent } from '../pages/topbar/topbar.component';


@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  isSidebarCollapsed = false;
  showSidebar = false;


  constructor(private eRef: ElementRef) { }

  onSidebarToggled(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const sidebar = this.eRef.nativeElement.querySelector('.sidebar_wrpr');
    const toggleButton = this.eRef.nativeElement.querySelector('app-topbar');
  
    const clickedInsideSidebar = sidebar?.contains(event.target as Node);
    const clickedToggleButton = toggleButton?.contains(event.target as Node);
  
    if (!clickedInsideSidebar && !clickedToggleButton && this.showSidebar) {
      this.showSidebar = false; 
    }
  }
  
  onSidebarItemSelected() {
    this.showSidebar = false; 
  }
  
}
