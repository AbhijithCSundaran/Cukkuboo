import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isSignedIn: boolean = false;
  showUserDropdown: boolean = false;
  private _unsubscribeAll: Subject<void> = new Subject<void>();
  constructor(
    private storageService: StorageService
  ) {
    this.storageService.onUpdateItem.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      var token = this.storageService.getItem('token');
      this.isSignedIn = token ? true : false;
    });
  }
  signOut() {
    localStorage.clear();
    this.storageService.updateItem('token', '');
  }
}
