import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/TempStorage/storageService';
import devtools from 'devtools-detect';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cukkuboo-website';
  devToolIsOpen: boolean = false;
  constructor(private storageService: StorageService) {
    const token = localStorage.getItem('token');
    if (token)
      this.storageService.updateItem('token', token);

  }
  ngOnInit(): void {
    if (devtools.isOpen)
      this.devToolIsOpen = true;
    window.addEventListener('devtoolschange', (event: any) => {
      // console.log('DevTools changed:', event.detail.isOpen);
      this.devToolIsOpen = true;
    });
    // this.detectDebugger();
  }

  @HostListener('window:devtoolschange', ['$event'])
  onDevToolsChange(event: any) {
    if (event.detail.isOpen) {
      this.devToolIsOpen = true;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    // event.preventDefault(); // Disable right-click
  }

  @HostListener('window:keydown', ['$event'])
  disableSpecialKeys(event: KeyboardEvent): void {
    const forbiddenKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
      'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];

    if (
      forbiddenKeys.includes(event.key) || event.ctrlKey || event.altKey) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  detectDebugger() {
    const check = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        this.devToolIsOpen = true;
      }
      setTimeout(check, 1000);
    };
    check();
  }
}
