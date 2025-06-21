import { Component, ElementRef, Input, ViewChild, AfterViewInit, HostListener, Inject, Output, EventEmitter } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'video-palyer',
  imports: [MatIconButton, MatIconModule, MatButtonModule],
  templateUrl: './palyer.component.html',
  styleUrl: './palyer.component.scss'
})
export class PalyerComponent {
  @Input() videoSrc!: string;
  @Input() autoplay: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(
  ) {
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    if (video) {
      // if (Hls.isSupported()) {
      //   const hls = new Hls();
      //   hls.loadSource(this.videoSrc);
      //   hls.attachMedia(video);
      // } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.videoSrc;
      if (this.autoplay)
        video.play();
    }
  }
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    // event.preventDefault(); // Disable right-click
  }

  Close() {
    this.onClose.emit(true)
  }
}
