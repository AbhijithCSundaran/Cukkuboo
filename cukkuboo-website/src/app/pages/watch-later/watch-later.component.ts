import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-watch-later',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './watch-later.component.html',
  styleUrls: ['./watch-later.component.scss']
})
export class WatchLaterComponent implements OnInit {
  watchLaterList: any[] = [];
  imageUrl: string = environment.apiUrl + 'uploads/images/';
  Math = Math;

  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;
  isLoading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService
  ) { }

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
    })
  }

  confirmDelete(item: any, index: number): void {
    if (!item || index < 0) return;
    this.movieService.deleteWatchLater(item.watch_later_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.watchLaterList.splice(index, 1);
          this.totalItems--;
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
    })
  }

  confirmClearAll(): void {
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
