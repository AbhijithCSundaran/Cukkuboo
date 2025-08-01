import { Component, AfterViewInit, ElementRef, ViewChildren, ViewChild, QueryList, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';
import { TruncatePipe } from '../../core/pipes/truncate-pipe';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { MatDialog } from '@angular/material/dialog';
import { SignInComponent } from '../sign-in/sign-in.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective, TruncatePipe],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.scss']
})
export class ReelsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('videoEl') videos!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('reelScroll') reelScroll!: ElementRef<HTMLDivElement>;

  reels: any[] = [];
  videoStates: boolean[] = [];
  mutedStates: boolean[] = [];
  progressValues: number[] = [];
  hoveredIndex: number | null = null;
  isFullscreen = false;
  private currentIndex = 0;

  stopInfiniteScroll: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  searchText: string = '';
  searchTimeout: any;
  userData: any;

  // Seekbar related
  isSeeking: boolean = false;
  activeSeekIndex: number | null = null;

  private videoUrl = environment.fileUrl + 'uploads/videos/';
  private imageUrl = environment.fileUrl + 'uploads/images/';

  constructor(
    private storageService: StorageService,
    private movieService: MovieService,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.route.paramMap.subscribe(params => {
      const reelId = this.route.snapshot.queryParamMap.get('re');
      if (reelId) {
        this.reels = [];
        this.videoStates = [];
        this.mutedStates = [];
        this.progressValues = [];
        const id = String(this.commonService.DecodeId(reelId));
        this.getReelById(id);
        this.router.navigate([], { queryParams: { re: null }, queryParamsHandling: 'merge' });
      } else {
        this.loadReels();
      }
    });
  }

  ngOnInit(): void {
    document.body.classList.add('reels-page');
    this.userData = this.storageService.getItem('userData');
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Array.from(this.videos).findIndex((v) => v.nativeElement === video);
          if (!video) return;

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

    this.videos.forEach((videoRef, i) => {
      const video = videoRef.nativeElement;

      video.addEventListener('timeupdate', () => {
        const percentage = (video.currentTime / video.duration) * 100;
        this.progressValues[i] = percentage || 0;
      });

      observer.observe(video);
    });

    this.videos.changes.subscribe(() => {
      this.videos.forEach((videoRef, i) => {
        const video = videoRef.nativeElement;

        video.addEventListener('timeupdate', () => {
          const percentage = (video.currentTime / video.duration) * 100;
          this.progressValues[i] = percentage || 0;
        });

        observer.observe(video);
      });
    });

    // Fullscreen on mobile
    if (window.innerWidth < 576 && !document.fullscreenElement) {
      const elem = document.documentElement;
      elem.requestFullscreen().then(() => {
        this.isFullscreen = true;
      }).catch(err => {
        console.warn("Fullscreen request failed:", err);
      });
    }

    window.addEventListener('keydown', this.handleKeydown);
    this.reelScroll.nativeElement.addEventListener('wheel', this.handleMouseWheel, { passive: false });
  }

  onScroll(): void {
    this.pageIndex++;
    this.loadReels(this.pageIndex, this.pageSize, this.searchText);
  }

  getReelById(id: string): void {
    this.movieService.getReelById(id).subscribe({
      next: (res) => {
        if (res?.success) {
          const newReel = [{
            id: Number(res.data.reels_id),
            video: this.videoUrl + (res.data.video || ''),
            image: this.imageUrl + (res.data.thumbnail || 'default-thumb.jpg'),
            title: this.capitalizeFirst(res.data.title),
            description: this.capitalizeFirst(res.data.description),
            likes: Number(res.data.likes) || 0,
            views: Number(res.data.views) || 0,
            is_liked_by_user: res.data.is_liked_by_user === true || res.data.is_liked_by_user === 1
          }];

          if (newReel) {
            this.reels = [...this.reels, ...newReel];
            this.videoStates.push(true);
            this.mutedStates.push(true);
            this.progressValues.push(0);
          }
        }
        this.loadReels();
      },
    });
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
            views: Number(data.views) || 0,
            is_liked_by_user: data.is_liked_by_user === true || data.is_liked_by_user === 1
          })) || [];

          if (newReels.length) {
            this.reels = [...this.reels, ...newReels];
            this.videoStates.push(...new Array(newReels.length).fill(true));
            this.mutedStates.push(...new Array(newReels.length).fill(true));
            this.progressValues.push(...new Array(newReels.length).fill(0));
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

  openLoginModal() {
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'reel',
      width: 'auto', height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.userData = this.storageService.getItem('userData');
      }
      this.dialog.closeAll();
    });
  }

  toggleLike(reel: any): void {
    this.userData = this.storageService.getItem('userData');
    if (!this.userData) {
      this.openLoginModal();
      return;
    }
    reel.clicked = true;
    const alreadyLiked = reel.is_liked_by_user;
    const model = {
      reels_id: reel.id,
      status: alreadyLiked ? 2 : 1
    };

    this.movieService.likeReel(model).subscribe({
      next: () => {
        reel.is_liked_by_user = !alreadyLiked;
        reel.likes += alreadyLiked ? -1 : 1;
        reel.clicked = false;
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        reel.clicked = false;
      }
    });
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

  onHover(index: number): void {
    this.hoveredIndex = index;
  }

  onLeave(index: number): void {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
  }

  capitalizeFirst(text: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
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

  toggleFullscreen(event: MouseEvent): void {
    event.stopPropagation();
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        this.scrollToIndex(this.currentIndex);
        this.isFullscreen = true;
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
        this.scrollToIndex(this.currentIndex);
      });
    }
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  copyUrlToClipboard(reel: any): void {
    if (document.hasFocus()) {
      const url = window.location.href.split('?')[0] + '?re=' + this.commonService.EncodeId(reel.id);
      navigator.clipboard?.writeText(url).then(() => {
        this.snackBar.open('Copied! Reel is ready to share.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
      }).catch(err => {
        console.error('Clipboard write failed:', err);
      });
    } else {
      alert('Please tap the screen and try again.');
    }
  }

  // Seekbar handlers
  onSeekStart(event: MouseEvent | TouchEvent, index: number): void {
    this.isSeeking = true;
    this.activeSeekIndex = index;
    this.seekTo(event, index);
    if (event.cancelable) event.preventDefault();
  }

  onSeekMove(event: MouseEvent | TouchEvent, index: number): void {
    if (!this.isSeeking || this.activeSeekIndex !== index) return;
    this.seekTo(event, index);
  }

  onSeekEnd(): void {
    this.isSeeking = false;
    this.activeSeekIndex = null;
  }

  private seekTo(event: MouseEvent | TouchEvent, index: number): void {
    const video = this.videos.get(index)?.nativeElement;
    if (!video) return;

    const seekbar = (event.target as HTMLElement).closest('.seekbar-wrapper') as HTMLElement;
    if (!seekbar) return;

    const rect = seekbar.getBoundingClientRect();
    const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);

    video.currentTime = percentage * video.duration;
    this.progressValues[index] = percentage * 100;
  }
  private wheelTimeout: any = null;

  handleMouseWheel = (event: WheelEvent) => {
    event.preventDefault(); // block default scroll

    if (this.wheelTimeout) return; // throttle scroll

    if (event.deltaY > 0) {
      this.scrollToNext();
    } else {
      this.scrollToPrev();
    }

    // throttle scrolling for 600ms
    this.wheelTimeout = setTimeout(() => {
      this.wheelTimeout = null;
    }, 600);
  };

  ngOnDestroy(): void {
    document.body.classList.remove('reels-page');
    window.removeEventListener('keydown', this.handleKeydown);
    if (this.reelScroll?.nativeElement) {
      this.reelScroll.nativeElement.removeEventListener('wheel', this.handleMouseWheel);
    }
  }
}