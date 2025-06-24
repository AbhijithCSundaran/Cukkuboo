import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/TempStorage/storageService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cukkuboo-website';
  constructor(private storageService: StorageService) {
    const token = localStorage.getItem('token');
    if (token)
      this.storageService.updateItem('token', token);

  }
}
