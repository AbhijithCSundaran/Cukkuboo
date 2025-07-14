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
          const userData = this.storageService.getItem('userData');
          if (userData)
            this.getrelatedMovies();
          else
            this.stopInfiniteScroll = true;
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
      if (!this.movieData.is_in_watch_history)
        this.addToWatchHistory(model);
      // if(check for view)
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
    debugger;
    this.movieService.viewVideo(model).subscribe({
      next: (res) => {
        if (res?.success) {
          console.log('Video view recorded.');
          this.movieData.views = Number(this.movieData.views) + 1;
          this.showSnackbar('Thanks for watching!', 'success');
        }
      },
      error: (err) => {
        console.error('Error recording video view:', err);
      }
    });
  }

  askGotoSubscription() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Access this movie by subscribing to our platform,<br>Do you want to go to <span>Subscriptions</span> page now?</p>`
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.router.navigate(['/subscribe']);
      }
    });
  }

  openLoginModal() {
    const dialogRef = this.dialog.open(SignInComponent, {
      data: 'movie',
      width: 'auto', height: 'auto',
      panelClass: 'signin-modal'
    });
    dialogRef.afterClosed().subscribe(() => {
      this.dialog.closeAll();
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
    if (!this.movieData?.mov_id) return;
    const model = { mov_id: this.movieData.mov_id };
    this.movieService.saveWatchlater(model).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data?.watch_later_id)
            this.movieData.watch_later_id = res.data?.watch_later_id;
          else
            this.router.navigate(['/watch-later']);
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
    if (!this.movieData?.watch_later_id) return;

    this.movieService.deleteWatchLater(this.movieData.watch_later_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movieData.watch_later_id = 0;
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

  copyUrlToClipboard(): void {
    if (document.hasFocus()) {
      const url = window.location.href.split('?')[0];
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Copied! Movie is ready to share.', '', {
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
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleMovieReaction(): void {
    if (!this.movieData || !this.movieData.mov_id) return;

    const movieId = this.movieData.mov_id;
    const isCurrentlyLiked = this.movieData.is_liked_by_user;
    const newStatus = isCurrentlyLiked ? 2 : 1;

    this.movieService.movieReaction(movieId, newStatus).subscribe({
      next: () => {
        this.movieData.is_liked_by_user = !isCurrentlyLiked;

        const currentLikes = parseInt(this.movieData.likes, 10) || 0;
        this.movieData.likes = isCurrentlyLiked
          ? Math.max(0, currentLikes - 1)
          : currentLikes + 1;
      },
      error: (err) => {
        console.error('Error updating like status:', err);
      }
    });
  }
}
