import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';
import { TopbarComponent } from '../pages/topbar/topbar.component';


@Component({
  selector: 'app-layout',
  imports: [RouterOutlet,SidebarComponent,TopbarComponent,CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  
  isSidebarCollapsed = false;

  onSidebarToggled(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
