import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-watch-later',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './watch-later.component.html',
  styleUrls: ['./watch-later.component.scss']
})
export class WatchLaterComponent implements OnInit {
  watchLaterList: any[] = [];
   Math = Math;
  imageUrl: string = environment.apiUrl + 'uploads/images/';

 
  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;
  isLoading: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private movieService: MovieService,
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
          this.watchLaterList = res.data;
          this.totalItems = res.total || res.data.length;
        } else {
          this.watchLaterList = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading watch later list:', err);
        this.watchLaterList = [];
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < Math.ceil(this.totalItems / this.pageSize)) {
      this.pageIndex = page;
      this.loadWatchLaterList();
    }
  }

  removeItem(index: number): void {
    const removedItem = this.watchLaterList[index];
    this.movieService.deleteWatchLater(removedItem?.watch_later_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.watchLaterList.splice(index, 1);
          this.snackBar.open('Successfully removed', '', {
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
            panelClass: ['snackbar-danger']
          });
        }
      },
      error: (err) => {
        console.error('Delete API error:', err);
      }
    });
  }

  clearWatchLater(): void {
    if (!confirm('Are you sure you want to clear all items from Watch Later?')) return;

    this.movieService.clearAllWatchLater().subscribe({
      next: (res) => {
        if (res?.success) {
          this.watchLaterList = [];
          this.totalItems = 0;
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
            panelClass: ['snackbar-danger']
          });
        }
      },
      error: (err) => {
        console.error('Clear Watch Later error:', err);
        this.snackBar.open('Something went wrong', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
        });
      }
    });
  }
}
