import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'js-player',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './js-player.component.html',
  styleUrl: './js-player.component.scss'
})
export class JsPlayerComponent {
  @Input() videoSrc!: string;
  @Input() controls: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() fullScreen: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('target') target!: ElementRef<HTMLVideoElement>;
  player!: Player;
  timeoutId: any;
  videoUrl: string = '';
  validExtensions = ['.mp4', '.m3u8', '.webm', '.ogg', '.mov', '.avi'];
  @HostBinding('class.showClose') showClose = false;
  constructor(private commonService: CommonService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc']) {
      if (changes['videoSrc'].currentValue) {
        const isVideoFormat = this.validExtensions.some(ext => this.videoSrc.toLowerCase().endsWith(ext));
        if (!isVideoFormat)
          this.videoSrc = structuredClone(this.commonService.decryptData(this.videoSrc, 'Abhijith123456789'));
        // this.videoSrc = structuredClone(this.commonService.decryptData('ctybwYg8CiK2p6u0bclvqqWGjCoP2GBkWBpShqSxtEjbXyOAbEcwakcmcPYcDqC5hSFSS9yxlnRFL+6vdEV26gsCXImfoIYutiIiOHuNpSmLUwghoj/QaBBdaZlDCO4O', 'Abhijith123456789'));
        this.ConvertToBlob(this.videoSrc)
      }
    }
  }

  ngAfterViewInit(): void {
    this.initVideoPlaying();
  }
  ConvertToBlob(videoSrc: string) {
    debugger;
    fetch(videoSrc)
      .then(response => {
        if (!response.ok) throw new Error('Video fetch failed');
        return response.blob(); // 👈 Convert to Blob
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob); // 👈 Convert to blob URL
        this.videoUrl = blobUrl;
        this.target.nativeElement.src = blobUrl;
        this.initVideoPlaying();
      })
      .catch(err => {
        console.error('Video load error:', err);
        this.initVideoPlaying();
      });
  }

  initVideoPlaying() {
    this.player = videojs(this.target.nativeElement, {
      controls: this.controls,
      autoplay: this.autoplay,
      preload: 'auto'
    });
    if (this.fullScreen)
      this.player.requestFullscreen();
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

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
