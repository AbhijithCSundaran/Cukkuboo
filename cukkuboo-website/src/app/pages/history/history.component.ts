import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';

interface HistoryItem {
  mov_id: string;
  title: string;
  description: string;
  thumbnail: string;
  completed_at: string;
}

interface ProcessedHistoryItem {
  id: number;
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
  historyList: ProcessedHistoryItem[] = [];
  imageUrl: string = environment.apiUrl + 'uploads/images/';

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    console.log('Calling getHistory API...');

    this.movieService.getHistory().subscribe({
      next: (res) => {
        console.log('History API Success:', res);

        if (res?.success && Array.isArray(res.data)) {
          const rawData: HistoryItem[] = res.data;

          this.historyList = rawData.map((item) => ({
            id: Number(item.mov_id),
            mov_id: item.mov_id,
            title: item.title,
            description: item.description,
            thumbnail: this.imageUrl + item.thumbnail,
            completed_at: item.completed_at
          }));

          console.log('Processed historyList:', this.historyList);
        } else {
          console.warn('No valid history data.');
          this.historyList = [];
        }
      },
      error: (err) => {
        console.error('History API Error:', err);
        this.historyList = [];
      }
    });
  }

  clearHistory(): void {
    this.historyList = [];
  }

  removeItem(index: number): void {
    this.historyList.splice(index, 1);
  }
}
