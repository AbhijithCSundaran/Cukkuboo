import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-js-player',
  imports: [],
  templateUrl: './js-player.component.html',
  styleUrl: './js-player.component.scss'
})
export class JsPlayerComponent {
  @Input() videoSrc!: string;
  @Input() autoplay: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    const video = this.videoRef.nativeElement;
    if (video) {
      video.src = this.videoSrc;
      if (this.autoplay) {
        video.play().catch(err => {
          console.error('Autoplay failed:', err);
        });
      }
    }
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Disable right-click
  }

  @HostListener('window:keydown', ['$event'])
  disableSpecialKeys(event: KeyboardEvent): void {
    const forbiddenKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
      'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];

    if (
      forbiddenKeys.includes(event.key) ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  Close(): void {
    this.onClose.emit(true);
  }
}
