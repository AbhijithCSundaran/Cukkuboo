import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  historyList: any[] = [];
  imageUrl: string = environment.apiUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;


  constructor(
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.movieService.getHistory(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.historyList = res.data.map((item: any) => ({
            watch_history_id: item.watch_history_id,
            mov_id: item.mov_id,
            title: item.title,
            description: item.description,
            thumbnail: this.imageUrl + item.thumbnail,
            completed_at: item.completed_at
          }));
          this.totalItems = res.total || 0;
        } else {
          this.historyList = [];
          this.totalItems = 0;
        }
      },
      error: (err) => {
        console.error('History fetch error:', err);
        this.historyList = [];
        this.totalItems = 0;
      }
    });
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
    debugger;
    this.movieService.deleteHistoryItem(item.watch_history_id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.historyList.splice(index, 1);
          this.totalItems--;
          this.snackBar.open('Item deleted from history', '', {
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
      data: { message: `<p>Are you sure you want to <span>clear all</span> history items?</p>` },
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
          this.totalItems = 0;
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

  nextPage(): void {
    if ((this.pageIndex + 1) * this.pageSize >= this.totalItems) return;
    this.pageIndex++;
    this.fetchHistory();
  }

  prevPage(): void {
    if (this.pageIndex === 0) return;
    this.pageIndex--;
    this.fetchHistory();
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
}
