import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.scss']
})
export class ReelsComponent implements OnInit, AfterViewInit {
  @ViewChildren('videoEl') videos!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('reelScroll') reelScroll!: ElementRef<HTMLDivElement>;

  reels: {
    video: string;
    image: string;
    title: string;
    description: string;
  }[] = [];

  videoStates: boolean[] = [];
  hoveredIndex: number | null = null;
  private currentIndex = 0;
  private videoUrl = environment.apiUrl + 'uploads/videos/';
  private imageUrl = environment.apiUrl + 'uploads/images/';

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getReelsData().subscribe({
      next: (response) => {
        this.reels = response?.data?.map((data: any) => ({
          video: this.videoUrl + (data.video || ''),
          image: this.imageUrl + (data.thumbnail || 'default-thumb.jpg'),
          title: data.title,
          description: data.description
        })) || [];

        this.videoStates = new Array(this.reels.length).fill(true);
      },
      error: (err) => {
        console.error('Error loading reels:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Array.from(this.videos).findIndex(
            (v) => v.nativeElement === video
          );
          if (entry.isIntersecting) {
            video.play();
            this.videoStates[index] = true;
          } else {
            video.pause();
            this.videoStates[index] = false;
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
  }

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
      } else {
        video.pause();
        this.videoStates[index] = false;
      }
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
}
