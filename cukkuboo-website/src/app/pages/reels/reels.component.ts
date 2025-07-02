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
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.scss']
})
export class ReelsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('videoEl') videos!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('reelScroll') reelScroll!: ElementRef<HTMLDivElement>;

  reels: {
    id: number;
    video: string;
    image: string;
    title: string;
    description: string;
    likes: number;
    views: number;
  }[] = [];

  videoStates: boolean[] = [];
  mutedStates: boolean[] = [];
  likedStates: boolean[] = [];
  hoveredIndex: number | null = null;
  isFullscreen = false;
  private currentIndex = 0;

  stopInfiniteScroll: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  searchText: string = '';
  searchTimeout: any;

  private videoUrl = environment.apiUrl + 'uploads/videos/';
  private imageUrl = environment.apiUrl + 'uploads/images/';

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    document.body.classList.add('reels-page');
    this.loadReels();
  }

  onScroll(event: any) {
    console.log('Scrolled - loading more reels...');
    this.pageIndex++;
    this.loadReels(this.pageIndex, this.pageSize, this.searchText);
  }

  loadReels(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.movieService.getReelsData(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          const newReels = res.data?.map((data: any) => ({
            id: Number(data.reels_id),
            video: this.videoUrl + (data.video || ''),
            image: this.imageUrl + (data.thumbnail || 'default-thumb.jpg'),
            title: this.capitalizeFirst(data.title),
            description: this.capitalizeFirst(data.description),
            likes: Number(data.likes) || 0,
            views: Number(data.views) || 0
          })) || [];

          console.log('Reels loaded:', newReels);

          if (newReels.length) {
            this.reels = [...this.reels, ...newReels];
            this.videoStates.push(...new Array(newReels.length).fill(true));
            this.mutedStates.push(...new Array(newReels.length).fill(true));
            this.likedStates.push(...new Array(newReels.length).fill(false));
          } else {
            this.stopInfiniteScroll = true;
          }
        }
      },
      error: (err) => {
        console.error('Error loading reels:', err);
        this.stopInfiniteScroll = true;
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;
      this.stopInfiniteScroll = false;
      this.reels = [];
      console.log('Search text changed:', this.searchText);
      this.loadReels(this.pageIndex, this.pageSize, this.searchText);
    }, 400);
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

            if (index !== this.currentIndex) {
              const prevMuted = this.mutedStates[this.currentIndex];
              this.mutedStates[index] = prevMuted;
              video.muted = prevMuted;
              this.currentIndex = index;
            }

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
      this.scrollToIndex(this.currentIndex + 1);
    }
  }

  scrollToPrev(): void {
    if (this.currentIndex > 0) {
      this.scrollToIndex(this.currentIndex - 1);
    }
  }

  private scrollToIndex(index: number): void {
    const container = this.reelScroll.nativeElement;
    const reelElements = container.querySelectorAll('.reel-container');

    if (reelElements[index]) {
      reelElements[index].scrollIntoView({ behavior: 'smooth' });

      const prevMuted = this.mutedStates[this.currentIndex];
      this.mutedStates[index] = prevMuted;

      const video = this.videos.get(index)?.nativeElement;
      if (video) video.muted = prevMuted;

      this.currentIndex = index;
    }
  }

  togglePlayPause(index: number): void {
    const video = this.videos.get(index)?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
        this.videoStates[index] = true;
      } else {
        video.pause();
        this.videoStates[index] = false;
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

  toggleLike(reel: any): void {
    const model = {
      reels_id: reel.id,
      status: 1
    };

    this.movieService.likeReel(model).subscribe({
      next: (res) => {
        reel.likes += 1;
        console.log('Reel liked:', res);
      },
      error: (err) => {
        console.error('Like failed:', err);
      }
    });
  }

  onShare(index: number): void {
    // TODO: Share logic here
    console.log('Share clicked for reel index:', index);
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
