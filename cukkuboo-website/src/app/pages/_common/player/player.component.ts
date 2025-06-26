import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'video-player',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements AfterViewInit {
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

  Close(): void {
    this.onClose.emit(true);
  }
}
