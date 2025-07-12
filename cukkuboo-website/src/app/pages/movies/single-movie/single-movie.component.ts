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
          this.getrelatedMovies();
        } else {
          this.showSnackbar('Failed to load movie.', 'error');
        }
      },
      error: () => {
        this.showSnackbar('Error loading movie data.', 'error');
        const res = {
          "success": true,
          "message": "Movie details fetched successfully.",
          "data": {
            "mov_id": "52",
            "video": null,
            "title": "Man of Steel",
            "genre": "0",
            "description": "\"Man of Steel\" is a 2013 American superhero film based on the DC Comics character Superman. It serves as a reboot of the Superman film series, focusing on Superman's origin story and his early days as a hero. The film explores his journey from being an alien child sent to Earth to embracing his destiny and becoming the symbol of hope for humanity. ",
            "cast_details": "Henry Cavill",
            "category": "0",
            "release_date": "2025-07-07",
            "age_rating": "2",
            "access": "1",
            "status": "1",
            "thumbnail": "1752260815_79b1c31132cf029b9189.jpg",
            "trailer": "1752260819_ce43588ba496d736bf08.mp4",
            "banner": "1752260973_d886892d16ef38dd3614.jpg",
            "duration": "0m 19s",
            "rating": "5",
            "likes": "0",
            "dislikes": "0",
            "views": "0",
            "created_by": null,
            "created_on": "2025-07-11 19:10:58",
            "modify_by": null,
            "modify_on": "2025-07-11 19:10:58"
          }
        }
        this.movieData = res.data;
        if (autoplay) this.playVideo(this.movieData.video);
        this.pageIndex = 0;
        this.stopInfiniteScroll = false;
        this.suggetionList = [];
        this.getrelatedMovies();
      }
    });
  }

  playVideo(video: string): void {
    const userData = this.storageService.getItem('userData')
    if (!userData) {
      this.openLoginModal();
      return;
    }
    if (!video || (this.movieData.access != 1 && userData.subscription_details?.subscription != 1)) {
      // this.showSnackbar('Access this movie by subscribing to our platform', 'error');
      this.askGotoSubscription();
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
    })
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
      },
      error: (err) => {
        console.error(err);
        const res = {
          "success": true,
          "message": "Related movies fetched successfully.",
          "data": [
            {
              "mov_id": "47",
              "video": "1752256739_8178bf67d88ac383de34.mp4",
              "title": "Forrest Gump",
              "genre": "0",
              "description": "Forrest Gump, American film, released in 1994, that chronicled 30 years (from the 1950s through the early 1980s) of the life of a intellectually disabled man (played by Tom Hanks) in an unlikely fable that earned critical praise, large audiences, and six Academy Awards, including best picture.",
              "cast_details": "Tom Hanks",
              "category": "0",
              "release_date": "2025-07-09",
              "age_rating": "2",
              "access": "2",
              "status": "1",
              "thumbnail": "1752256475_b74c810b46f5f8bcc5a9.jpg",
              "trailer": "1752256848_2db44707e6b3a1614768.mp4",
              "banner": "1752256557_accc0883627203e5c598.jpg",
              "duration": "0m 25s",
              "rating": "5",
              "likes": "0",
              "dislikes": "0",
              "views": "0",
              "created_by": null,
              "created_on": "2025-07-11 18:03:34",
              "modify_by": null,
              "modify_on": "2025-07-11 18:14:23"
            },
            {
              "mov_id": "46",
              "video": "1752256100_51f74604a8d09d5a6a07.mp4",
              "title": " Predestination",
              "genre": "0",
              "description": "\"Predestination\" is a mind-bending 2014 Australian sci-fi thriller about a temporal agent tasked with preventing a devastating bombing in New York City. The film explores complex time travel paradoxes and identity, as the agent's mission intertwines with his own past and future, creating a closed temporal loop. The movie is based on a short story by Robert A. Heinlein. ",
              "cast_details": "Sarah Snook, Ethan Hawke",
              "category": "0",
              "release_date": "2025-07-01",
              "age_rating": "2",
              "access": "2",
              "status": "1",
              "thumbnail": "1752255292_17caaab04c71983853ef.jpg",
              "trailer": "1752255968_96b5d5c81da3467d5ff0.mp4",
              "banner": "1752255289_4ec3049235cabbf6eb29.jpg",
              "duration": "0m 20s",
              "rating": "5",
              "likes": "0",
              "dislikes": "0",
              "views": "0",
              "created_by": null,
              "created_on": "2025-07-11 17:48:31",
              "modify_by": null,
              "modify_on": "2025-07-11 17:48:31"
            },
            {
              "mov_id": "41",
              "video": "1751872631_8e4c4027f892674f9711.mp4",
              "title": "La La Land",
              "genre": "2",
              "description": "\"La La Land\" is a 2016 romantic musical comedy-drama film written and directed by Damien Chazelle, starring Ryan Gosling and Emma Stone. It tells the story of a jazz pianist, Sebastian, and an aspiring actress, Mia, who fall in love while pursuing their dreams in Los Angeles. The film's title refers both to the city of Los Angeles and to the idiom for being out of touch with reality. ",
              "cast_details": "Ryan Gosling, Emma Stones",
              "category": "1",
              "release_date": "2025-06-30",
              "age_rating": "2",
              "access": "1",
              "status": "1",
              "thumbnail": "1751648909_62cd703e0dc40698ff86.jpg",
              "trailer": "1751648800_fb358d76fea613791a0c.mp4",
              "banner": "1751648909_8b82efe3e603147aef12.jpg",
              "duration": "0m 13s",
              "rating": "5",
              "likes": "1",
              "dislikes": "0",
              "views": "0",
              "created_by": null,
              "created_on": "2025-07-04 17:08:33",
              "modify_by": null,
              "modify_on": "2025-07-07 07:17:13"
            }
          ]
        }
        this.suggetionList = [...this.suggetionList, ...res.data];
      }
    });
  }
}
