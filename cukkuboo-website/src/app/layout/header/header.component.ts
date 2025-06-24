import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isSignedIn: boolean = false;
  showUserDropdown: boolean = false;

  private _menuOpen = false;
  get menuOpen(): boolean {
    return this._menuOpen;
  }
  set menuOpen(value: boolean) {
    this._menuOpen = value;
    if (value) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef
  ) {
    this.storageService.onUpdateItem
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        const token = this.storageService.getItem('token');
        this.isSignedIn = !!token;
      });
  }

  signOut() {
    localStorage.clear();
    this.storageService.updateItem('token', '');
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
}
