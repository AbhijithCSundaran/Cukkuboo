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
import { ConfirmationDialogComponent } from '../../../core/components/confirmation-dialog/confirmation-dialog.component';

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
    private router: Router,
    private movieService: MovieService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
        if (res?.success) {
          this.movieData = res.data;
          if (autoplay) this.playVideo(this.movieData.video);
          this.pageIndex = 0;
          this.stopInfiniteScroll = false;
          this.suggetionList = [];

          const userData = this.storageService.getItem('userData');
          if (userData) this.getrelatedMovies();
          else this.stopInfiniteScroll = true;
        } else {
          this.showSnackbar('Failed to load movie.', 'error');
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  playVideo(video: string, isTrailer: boolean = false): void {
    const userData = this.storageService.getItem('userData');
    if (!isTrailer) {
      if (!userData) {
        this.openLoginModal();
        return;
      }
      if (!video || (this.movieData.access != 1 && userData.subscription_details?.subscription != 1)) {
        this.askGotoSubscription();
        return;
      }
    }
    this.selectedVideo = video;

    if (video === this.movieData.video) {
      const model = { mov_id: this.movieData.mov_id };
      if (!this.movieData.is_in_watch_history) this.addToWatchHistory(model);
      this.addToView(model);
    }
  }

  addToWatchHistory(model: any) {
    this.movieService.saveHistory(model).subscribe({
      next: () => console.log('Watch history saved.'),
      error: (err) => console.error('Error saving watch history:', err)
    });
  }

  addToView(model: any) {
    this.movieService.viewVideo(model).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.views = Number(this.movieData.views) + 1;
          // this.showSnackbar('Thanks for watching!', 'success');
        }
      },
      error: (err) => {
        console.error('Error recording video view:', err);
      }
    });
  }

  openLoginModal() {
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'movie',
      width: 'auto',
      height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getMovie(this.movieData.mov_id, true);
      }
      this.dialog.closeAll();
    });
  }

  askGotoSubscription() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Access this movie by subscribing to our platform,<br>Do you want to go to <span>Subscriptions</span> page now?</p>`
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.router.navigate(['/subscribe']);
      }
    });
  }

  toggleWatchLater(): void {
    const userData = this.storageService.getItem('userData');
    if (!userData) {
      this.openLoginModal();
      return;
    }

    if (this.movieData.watch_later_id)
      this.removeFromWatchLater();
    else
      this.addToWatchLater();
  }

  addToWatchLater(): void {
    const model = { mov_id: this.movieData.mov_id };
    this.movieService.saveWatchlater(model).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.watch_later_id = res.data?.watch_later_id || 0;
          this.showSnackbar('Added to Watch Later!', 'success');
        } else {
          this.showSnackbar(res?.message || 'Failed to add.', 'error');
        }
      },
      error: () => this.showSnackbar('Error saving Watch Later.', 'error')
    });
  }

  removeFromWatchLater(): void {
    this.movieService.deleteWatchLater(this.movieData.watch_later_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.watch_later_id = 0;
          this.showSnackbar('Removed from Watch Later!', 'success');
        } else {
          this.showSnackbar(res?.message || 'Failed to remove.', 'error');
        }
      },
      error: () => this.showSnackbar('Error removing Watch Later.', 'error')
    });
  }

  copyUrlToClipboard(): void {
    if (document.hasFocus()) {
      const url = window.location.href.split('?')[0];
      navigator.clipboard.writeText(url).then(() => {
        this.showSnackbar('Copied! Movie is ready to share.', 'success');
      }).catch(err => {
        console.error('Clipboard write failed:', err);
      });
    } else {
      alert('Please tap the screen and try again.');
    }
  }

 toggleMovieReaction(reactionType: number): void {
  if (!this.movieData || !this.movieData.mov_id) return;

  const movieId = this.movieData.mov_id;

  this.movieService.movieReaction(movieId, reactionType).subscribe({
    next: () => {
      if (reactionType === 1) {
        // Toggling like
        if (this.movieData.is_liked_by_user) {
          this.movieData.likes = Math.max(0, (this.movieData.likes || 0) - 1);
          this.movieData.is_liked_by_user = false;
        } else {
          this.movieData.likes = (this.movieData.likes || 0) + 1;
          this.movieData.is_liked_by_user = true;
          if (this.movieData.is_disliked_by_user) {
            this.movieData.dislikes = Math.max(0, (this.movieData.dislikes || 0) - 1);
            this.movieData.is_disliked_by_user = false;
          }
        }
      } else if (reactionType === 2) {
        // Toggling dislike
        if (this.movieData.is_disliked_by_user) {
          this.movieData.dislikes = Math.max(0, (this.movieData.dislikes || 0) - 1);
          this.movieData.is_disliked_by_user = false;
        } else {
          this.movieData.dislikes = (this.movieData.dislikes || 0) + 1;
          this.movieData.is_disliked_by_user = true;
          if (this.movieData.is_liked_by_user) {
            this.movieData.likes = Math.max(0, (this.movieData.likes || 0) - 1);
            this.movieData.is_liked_by_user = false;
          }
        }
      }
    },
    error: (err) => console.error('Error updating reaction:', err)
  });
}


  showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }

  onScroll(): void {
    this.pageIndex++;
    this.getrelatedMovies();
  }

  getrelatedMovies(): void {
    this.movieService.getrelatedMovies(this.movieData.mov_id, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res?.success && res.data.length) {
          this.suggetionList = [...this.suggetionList, ...res.data];
        } else {
          this.stopInfiniteScroll = true;
        }
      },
      error: (err) => console.error(err)
    });
  }
}
