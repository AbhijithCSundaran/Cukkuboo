import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.scss']
})
export class ReelsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('videoEl') videos!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('reelScroll') reelScroll!: ElementRef<HTMLDivElement>;

  reels: { video: string; image: string; title: string; description: string }[] = [];
  videoStates: boolean[] = [];
  mutedStates: boolean[] = [];
  likedStates: boolean[] = [];
  hoveredIndex: number | null = null;
  private currentIndex = 0;
  isFullscreen = false;

  private videoUrl = environment.apiUrl + 'uploads/videos/';
  private imageUrl = environment.apiUrl + 'uploads/images/';

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    document.body.classList.add('reels-page');

    this.movieService.getReelsData().subscribe({
      next: (response) => {
        this.reels = response?.data?.map((data: any) => ({
          video: this.videoUrl + (data.video || ''),
          image: this.imageUrl + (data.thumbnail || 'default-thumb.jpg'),
          title: this.capitalizeFirst(data.title),
          description: this.capitalizeFirst(data.description)
        })) || [];

        const count = this.reels.length;
        this.videoStates = new Array(count).fill(true);
        this.mutedStates = new Array(count).fill(true);
        this.likedStates = new Array(count).fill(false);
      },
      error: (err) => console.error('Error loading reels:', err)
    });
  }

  capitalizeFirst(text: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Array.from(this.videos).findIndex((v) => v.nativeElement === video);
          if (entry.isIntersecting) {
            video.play();
            this.videoStates[index] = true;
            document.querySelector('.site-header')?.classList.add('hidden-header');
          } else {
            video.pause();
            this.videoStates[index] = false;
            document.querySelector('.site-header')?.classList.remove('hidden-header');
          }
        });
      },
      { threshold: 0.6 }
    );

    this.videos.changes.subscribe(() => {
      this.videos.forEach((videoRef) => observer.observe(videoRef.nativeElement));
    });

    setTimeout(() => {
      this.videos.forEach((videoRef) => observer.observe(videoRef.nativeElement));
    });

    window.addEventListener('keydown', this.handleKeydown);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('reels-page');
    window.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') this.scrollToNext();
    if (e.key === 'ArrowUp') this.scrollToPrev();
  };

  scrollToNext(): void {
    if (this.currentIndex < this.reels.length - 1) {
      this.currentIndex++;
      this.scrollToIndex(this.currentIndex);
    }
  }

  scrollToPrev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToIndex(this.currentIndex);
    }
  }

  private scrollToIndex(index: number): void {
    const container = this.reelScroll.nativeElement;
    const reelElements = container.querySelectorAll('.reel-container');
    if (reelElements[index]) {
      reelElements[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  togglePlayPause(index: number): void {
    const video = this.videos.get(index)?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
        this.videoStates[index] = true;
        document.querySelector('.site-header')?.classList.add('hidden-header');
      } else {
        video.pause();
        this.videoStates[index] = false;
        document.querySelector('.site-header')?.classList.remove('hidden-header');
      }

      this.hoveredIndex = index;
      setTimeout(() => {
        if (this.hoveredIndex === index) {
          this.hoveredIndex = null;
        }
      }, 1000);
    }
  }

  toggleMute(index: number): void {
    const video = this.videos.get(index)?.nativeElement;
    if (video) {
      this.mutedStates[index] = !this.mutedStates[index];
      video.muted = this.mutedStates[index];
    }
  }

  toggleLike(index: number): void {
    this.likedStates[index] = !this.likedStates[index];
  }

  onShare(index: number): void {
    console.log('Shared reel at index:', index);
  }

  onHover(index: number): void {
    this.hoveredIndex = index;
  }

  onLeave(index: number): void {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
  }

  toggleFullscreen(event: MouseEvent): void {
    event.stopPropagation();
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => (this.isFullscreen = true));
    } else {
      document.exitFullscreen().then(() => (this.isFullscreen = false));
    }
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
