import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule, InfiniteScrollDirective],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  historyList: any[] = [];
  imageUrl: string = environment.fileUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;
  stopInfiniteScroll: boolean = false;
  isLoading: boolean = false;

  constructor(
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.isLoading = true;
    this.movieService.getHistory(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success && Array.isArray(res.data)) {
          if (this.pageIndex === 0) {
            this.historyList = res.data;
          } else {
            this.historyList = [...this.historyList, ...res.data];
          }

          this.totalItems = res.total || this.historyList.length;
          if (!res.data.length || this.historyList.length >= this.totalItems) {
            this.stopInfiniteScroll = true;
          }
        } else {
          this.stopInfiniteScroll = true;
        }
      },
      error: (err) => {
        console.error('History fetch error:', err);
        this.isLoading = false;
        this.stopInfiniteScroll = true;
      }
    });
  }

  onScroll(): void {
    if (!this.stopInfiniteScroll && !this.isLoading) {
      this.pageIndex++;
      this.fetchHistory();
    }
  }

  askToRemoveItem(item: any, index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `<p>Are you sure you want to remove <span>"${item?.title}"</span> from history?</p>`
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmDelete(item, index);
      }
    })
  }

  confirmDelete(item: any, index: number): void {
    if (!item) return;
    this.movieService.deleteHistoryItem(item.watch_history_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.historyList.splice(index, 1);
          this.totalItems--;
          this.snackBar.open('Item removed from Watch History successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open('Failed to delete item', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: () => {
        this.snackBar.open('Error deleting item', '', {
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
      data: { message: `<p>Are you sure you want to <span>clear all</span> items from Watch History?</p>` },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.confirmClearAll();
      }
    })
  }

  confirmClearAll(): void {
    this.movieService.clearAllHistory().subscribe({
      next: (res) => {
        if (res?.success && res?.data?.cleared) {
          this.historyList = [];
          this.pageIndex = 0;
          this.totalItems = 0;
          this.stopInfiniteScroll = false;
          this.snackBar.open(res.message || 'All history cleared.', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-success']
          });
        } else {
          this.snackBar.open(res.message || 'Failed to clear history.', '', {
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
}
