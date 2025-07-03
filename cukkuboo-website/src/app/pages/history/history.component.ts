import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface HistoryItem {
  save_history_id: number;
  mov_id: string;
  title: string;
  description: string;
  thumbnail: string;
  completed_at: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  historyList: HistoryItem[] = [];
  imageUrl: string = environment.apiUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 8;
  totalItems: number = 0;

  constructor(
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.movieService.getHistory(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.historyList = res.data.map((item: any) => ({
            save_history_id: item.save_history_id,
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

clearHistory(): void {


  if (!confirm('Are you sure you want to clear all history items?')) return;

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
          panelClass: ['snackbar-danger']
        });
      }
    },
    error: (err) => {
      console.error('Clear history error:', err);
      this.snackBar.open('Something went wrong', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snackbar-danger']
      });
    }
  });
}


  removeItem(index: number): void {
    const item = this.historyList[index];
    if (!item || !item.save_history_id) return;

    if (!confirm(`Remove "${item.title}" from history?`)) return;

    this.movieService.deleteHistoryItem(item.save_history_id).subscribe({
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
        }
      },
      error: (err) => {
        console.error('Delete item error:', err);
        this.snackBar.open('Error deleting item', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-danger']
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
