import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';

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
  @HostBinding('class.showClose') showClose = false;

  ngAfterViewInit(): void {
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
