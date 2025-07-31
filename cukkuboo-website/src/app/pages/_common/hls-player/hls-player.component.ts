import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Hls from 'hls.js';

@Component({
  selector: 'hls-player',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './hls-player.component.html',
  styleUrls: ['./hls-player.component.scss']
})
export class HlsPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() videoSrc: string = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  @ViewChild('videoPlayer', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @Input() controls: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() fullScreen: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  private hls?: Hls;

  timeoutId: any;
  @HostBinding('class.showClose') showClose = false;
  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.videoSrc);
      this.hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.videoSrc;
    }
  }
  @HostListener('mouseenter')
  onMouseEnter() {
    this.resetTimeout();
  }

  @HostListener('mousemove')
  onMouseMove() {
    this.resetTimeout();
  }

  // @HostListener('mouseleave')
  // onMouseLeave() {
  //   this.showClose = false;
  //   if (this.timeoutId) {
  //     clearTimeout(this.timeoutId);
  //     this.timeoutId = null;
  //   }
  // }

  private resetTimeout() {
    this.showClose = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.showClose = false;
      this.timeoutId = null;
    }, 2500);
  }

  Close(): void {
    this.onClose.emit(true);
  }

  ngOnDestroy() {
    this.hls?.destroy();
  }
}
