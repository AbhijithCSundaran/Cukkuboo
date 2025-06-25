import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
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

  reels: {
    video: string;
    image: string;
    title: string;
    description: string;
  }[] = [];

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
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    this.videos.changes.subscribe(() => {
      this.videos.forEach((videoRef) => observer.observe(videoRef.nativeElement));
    });
  }
}
