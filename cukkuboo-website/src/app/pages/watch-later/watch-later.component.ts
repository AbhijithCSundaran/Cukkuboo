import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-watch-later',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InfiniteScrollDirective
  ],
  templateUrl: './watch-later.component.html',
  styleUrls: ['./watch-later.component.scss']
})
export class WatchLaterComponent implements OnInit {
  watchLaterList: any[] = [];
  imageUrl: string = environment.fileUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;
  stopInfiniteScroll: boolean = false;
  isLoading: boolean = false;
  randomBanner: string = 'assets/images/background/movie_banner.jpg';

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadWatchLaterList();
  }


loadWatchLaterList(): void {
  this.isLoading = true;
  this.movieService.getWatchLaterList(this.pageIndex, this.pageSize).subscribe({
    next: (res) => {
      this.isLoading = false;
      if (res?.success && Array.isArray(res.data)) {
        if (this.pageIndex === 0) {
          this.watchLaterList = res.data;

          // Get banners and select one at random
          const banners = res.data.map((m: any) => m.banner).filter((b: string) => !!b);
          if (banners.length) {
            const randomIndex = Math.floor(Math.random() * banners.length);
            this.randomBanner = this.imageUrl + banners[randomIndex];
          } else {
            this.randomBanner = 'assets/images/background/movie_banner.jpg';
          }

        } else {
          this.watchLaterList = [...this.watchLaterList, ...res.data];
        }

        this.totalItems = res.total || this.watchLaterList.length;
        if (!res.data.length || this.watchLaterList.length >= this.totalItems) {
          this.stopInfiniteScroll = true;
        }
      } else {
        this.stopInfiniteScroll = true;
      }
    },
    error: (err) => {
      console.error('Error loading watch later list:', err);
      this.isLoading = false;
      this.stopInfiniteScroll = true;
      this.randomBanner = 'assets/images/background/movie_banner.jpg';
    }
  });
}


  onScroll(): void {
    if (!this.stopInfiniteScroll && !this.isLoading) {
      this.pageIndex++;
      this.loadWatchLaterList();
    }
  }

  askToRemoveItem(item: any, index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Are you sure you want to remove <span>"${item?.title}"</span> from Watch Later?</p>`
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmDelete(item, index);
      }
    });
  }

  confirmDelete(item: any, index: number): void {
    if (!item || index < 0) return;
    this.movieService.deleteWatchLater(item.watch_later_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.watchLaterList.splice(index, 1);
          this.totalItems--;
          this.snackBar.open('Item removed from Watch Later successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open('Failed to remove', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: () => {
        this.snackBar.open('Something went wrong', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  askToClearAll() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `<p>Are you sure you want to <span>clear all</span>  items from Watch Later?</p>` },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmClearAll();
      }
    });
  }

  confirmClearAll(): void {
    this.movieService.clearAllWatchLater().subscribe({
      next: (res) => {
        if (res?.success) {
          this.watchLaterList = [];
          this.totalItems = 0;
          this.pageIndex = 0;
          this.stopInfiniteScroll = false;
          this.snackBar.open('All Watch Later items cleared', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open('Failed to clear Watch Later list', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        console.error('Clear Watch Later error:', err);
        this.snackBar.open('Something went wrong', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
