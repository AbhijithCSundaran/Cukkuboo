import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  historyList: HistoryItem[] = [];
  imageUrl: string = environment.apiUrl + 'uploads/images/';

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.movieService.getHistory().subscribe({
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
        } else {
          this.historyList = [];
        }
      },
      error: (err) => {
        console.error('History fetch error:', err);
        this.historyList = [];
      }
    });
  }

  clearHistory(): void {
    if (!confirm('Are you sure you want to clear all history?')) return;

    this.movieService.clearAllHistory().subscribe({
      next: (res) => {
        if (res?.success) {
          this.historyList = [];
          alert('History cleared.');
        }
      },
      error: (err) => {
        console.error('Clear history error:', err);
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
          alert('Item deleted.');
        }
      },
      error: (err) => {
        console.error('Delete item error:', err);
      }
    });
  }
}
