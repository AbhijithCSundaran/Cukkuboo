import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'js-player',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './js-player.component.html',
  styleUrl: './js-player.component.scss'
})
export class JsPlayerComponent {
  @Input() videoSrc!: any;
  @Input() controls: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() fullScreen: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('target') target!: ElementRef<HTMLVideoElement>;
  player!: Player;
  timeoutId: any;
  blobUrl: any = '';
  fileUrl: string = environment.fileUrl + 'uploads/videos/';
  validExtensions = ['.mp4', '.m3u8', '.webm', '.ogg', '.mov', '.avi'];
  @HostBinding('class.showClose') showClose = false;
  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc']) {
      if (changes['videoSrc'].currentValue) {
        const isVideoFormat = this.validExtensions.some(ext => this.videoSrc.toLowerCase().endsWith(ext));
        if (!isVideoFormat)
          this.videoSrc = structuredClone(this.commonService.decryptData(this.videoSrc, 'Abhijith123456789'));
        this.ConvertToBlob(this.fileUrl + this.videoSrc)
        // this.videoSrc = this.sanitizer.bypassSecurityTrustResourceUrl('blob:https://www.netflix.com/dec19f37-7cb5-4243-9685-a50fdbceaeeb')
      }
    }
  }

  ngAfterViewInit(): void {
    this.initVideoPlaying();
  }
  get token(): string | null {
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
  }
  ConvertToBlob(videoSrc: string) {
    fetch(videoSrc + `?token=${'abcd123'}'`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).then(res => res.blob())
      .then(blob => {
        // fetch(videoSrc)
        //   .then(response => {
        //     if (!response.ok) throw new Error('Video fetch failed');
        //     return response.blob(); // 👈 Convert to Blob
        //   })
        //   .then(blob => {
        debugger;
        const blobUrl = URL.createObjectURL(blob); // 👈 Convert to blob URL
        this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl)
        this.target.nativeElement.src = this.blobUrl?.changingThisBreaksApplicationSecurity;
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
