import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MovieService } from '../../../services/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { InfiniteScrollDirective } from '../../../core/directives/infinite-scroll/infinite-scroll.directive';
import { JsPlayerComponent } from '../../_common/js-player/js-player.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-single-movie',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JsPlayerComponent,
    InfiniteScrollDirective
  ],
  templateUrl: './single-movie.component.html',
  styleUrls: ['./single-movie.component.scss']
})
export class SingleMovieComponent implements OnInit {
  pageIndex = 0;
  pageSize = 10;
  stopInfiniteScroll = false;
  movieData: any;
  selectedVideo = '';
  fullScreen = false;
  videoUrl = environment.apiUrl + 'uploads/videos/';
  imageUrl = environment.apiUrl + 'uploads/images/';
  suggetionList: any[] = [];
  isInWatchLater = false;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const autoplay = this.route.snapshot.queryParamMap.get('ap');
      if (id) this.getMovie(id, autoplay);
    });
  }

  ngOnInit(): void {}

  getMovie(id: number, autoplay: any): void {
    this.selectedVideo = '';
    this.movieService.getMovieById(id).subscribe({
      next: (res) => {
        if (res?.data) {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          this.movieData = data;
          if (autoplay) this.playVideo(this.movieData.video);
          this.pageIndex = 0;
          this.stopInfiniteScroll = false;
          this.suggetionList = [];
          this.isInWatchLater = false; 
          this.getrelatedMovies();
        } else {
          this.snackBar.open('Failed to load movie.', '', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      },
      error: () => {
        this.snackBar.open('Error loading movie data.', '', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  playVideo(video: string): void {
    this.selectedVideo = video;  if (!video) {
    this.snackBar.open('Please subscribe to watch this Movie.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
 
    this.router.navigate(['/subscribe']);
    return;
  }



    if (video === this.movieData.video) {
      const model = { mov_id: this.movieData.mov_id };
      this.movieService.saveHistory(model).subscribe({
        next: () => console.log('Watch history saved.'),
        error: (err) => console.error('Error saving watch history:', err)
      });
    }
  }

addToWatchLater(): void {
  if (this.isInWatchLater || !this.movieData?.mov_id) return;

  const model = { mov_id: this.movieData.mov_id };

  this.movieService.saveWatchlater(model).subscribe({
    next: (res) => {
      console.log('Watch Later response:', res); 

      if (res?.success) {
        this.isInWatchLater = true;
        this.snackBar.open('Added to Watch Later!', '', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      } else {
        this.snackBar.open(res?.message || 'Failed to add.', '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    },
    error: (err) => {
      console.error('Error saving Watch Later:', err);
      this.snackBar.open('Error saving Watch Later.', '', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}

  shareMovie(): void {
    const movieUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.movieData.title,
        text: 'Check out this movie!',
        url: movieUrl
      }).catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(movieUrl).then(() => {
        this.snackBar.open('Link copied to clipboard!', '', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      });
    }
  }

  onScroll() {
    this.pageIndex++;
    this.getrelatedMovies();
  }

  getrelatedMovies() {
    this.movieService.getrelatedMovies(this.movieData.mov_id, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length) {
            this.suggetionList = [...this.suggetionList, ...res.data];
          } else {
            this.stopInfiniteScroll = true;
          }
        }
      }
    });
  }
}
