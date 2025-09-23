import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Hls from 'hls.js';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'hls-player',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './hls-player.component.html',
  styleUrls: ['./hls-player.component.scss']
})
export class HlsPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() videoSrc: string = '';
  @ViewChild('videoPlayer', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @Input() controls: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() fullScreen: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  fileUrl: string = environment.fileUrl + 'uploads/';
  validExtensions = ['.mp4', '.m3u8', '.webm', '.ogg', '.mov', '.avi'];
  private hls?: Hls;

  timeoutId: any;
  @HostBinding('class.showClose') showClose = false;

  constructor(
    private commonService: CommonService,
    // private sanitizer: DomSanitizer
  ) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    debugger;
    if (changes['videoSrc']) {
      if (changes['videoSrc'].currentValue) {
        const isVideoFormat = this.validExtensions.some(ext => this.videoSrc.toLowerCase().endsWith(ext));
        if (!isVideoFormat)
          this.videoSrc = structuredClone(this.commonService.decryptData(this.videoSrc, 'Abhijith123456789'));
        // this.videoSrc = this.sanitizer.bypassSecurityTrustResourceUrl('blob:https://www.netflix.com/dec19f37-7cb5-4243-9685-a50fdbceaeeb')
      }
    }
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    // if (Hls.isSupported()) {
    //   this.hls = new Hls();
    //   this.hls.loadSource(this.fileUrl+this.videoSrc);
    //   this.hls.attachMedia(video);
    // } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    //   video.src = this.videoSrc;
    // }
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.fileUrl + this.videoSrc);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => {
          console.warn("Autoplay blocked by browser, showing play button instead.", err);
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.fileUrl + this.videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => {
          console.warn("Autoplay blocked by browser, showing play button instead.", err);
        });
      });
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
