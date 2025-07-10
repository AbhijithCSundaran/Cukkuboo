import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MovieService } from '../../../services/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { InfiniteScrollDirective } from '../../../core/directives/infinite-scroll/infinite-scroll.directive';
import { JsPlayerComponent } from '../../_common/js-player/js-player.component';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/TempStorage/storageService';
import { SignInComponent } from '../../sign-in/sign-in.component';

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
  videoUrl = environment.apiUrl + 'uploads/videos/';
  imageUrl = environment.apiUrl + 'uploads/images/';
  suggetionList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const autoplay = this.route.snapshot.queryParamMap.get('ap');
      if (id) this.getMovie(id, autoplay);
    });
  }

  ngOnInit(): void { }

  showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }

  getMovie(id: number, autoplay: any): void {
    this.selectedVideo = '';
    this.movieService.getMovieById(id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData = res.data;
          if (autoplay) this.playVideo(this.movieData.video);
          this.pageIndex = 0;
          this.stopInfiniteScroll = false;
          this.suggetionList = [];
          this.getrelatedMovies();
        } else {
          this.showSnackbar('Failed to load movie.', 'error');
        }
      },
      error: () => {
        this.showSnackbar('Error loading movie data.', 'error');
      }
    });
  }

  playVideo(video: string): void {
    const userData = this.storageService.getItem('userData')
    if (!userData) {
      this.openLoginModal();
      return;
    }
    if (!video) {
      this.showSnackbar('Access this movie by subscribing to our platform', 'error');
      this.router.navigate(['/subscribe']);
      return;
    }
    this.selectedVideo = video;

    if (video === this.movieData.video) {
      const model = { mov_id: this.movieData.mov_id };
      this.movieService.saveHistory(model).subscribe({
        next: () => console.log('Watch history saved.'),
        error: (err) => console.error('Error saving watch history:', err)
      });
    }
  }
  openLoginModal() {
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'movie',
      width: 'auto', height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
      this.dialog.closeAll();
    });
  }

  toggleWatchLater(): void {
    if (this.movieData.is_in_watch_later) {
      this.removeFromWatchLater();
    } else {
      this.addToWatchLater();
    }
  }

  addToWatchLater(): void {
    if (!this.movieData?.mov_id) return;
    const model = { mov_id: this.movieData.mov_id };
    this.movieService.saveWatchlater(model).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.is_in_watch_later = true;
          this.showSnackbar('Added to Watch Later!', 'success');
        } else {
          this.showSnackbar(res?.message || 'Failed to add.', 'error');
        }
      },
      error: () => {
        this.showSnackbar('Error saving Watch Later.', 'error');
      }
    });
  }

  removeFromWatchLater(): void {
    if (!this.movieData?.mov_id) return;

    this.movieService.deleteWatchLater(this.movieData.mov_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.is_in_watch_later = false;
          this.showSnackbar('Removed from Watch Later!', 'success');
        } else {
          this.showSnackbar(res?.message || 'Failed to remove.', 'error');
        }
      },
      error: () => {
        this.showSnackbar('Error removing Watch Later.', 'error');
      }
    });
  }

  shareMovie(): void {

  }

  onScroll(): void {
    this.pageIndex++;
    this.getrelatedMovies();
  }

  getrelatedMovies(): void {
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
