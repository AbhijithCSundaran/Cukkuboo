import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';

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

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadWatchLaterList();
  }

  loadWatchLaterList(): void {
    this.movieService.getWatchLaterList().subscribe({
      next: (res) => {
        console.log('Watch Later Response:', res); // ✅ Console log response
        if (res?.success && Array.isArray(res.data)) {
          this.watchLaterList = res.data;
          console.log('Watch Later List:', this.watchLaterList); // ✅ Confirm list
        } else {
          this.watchLaterList = [];
          console.warn('Watch Later list is empty or invalid format.');
        }
      },
      error: (err) => {
        console.error('Error loading watch later list:', err);
        this.watchLaterList = [];
      }
    });
  }

  removeItem(index: number): void {
    const removed = this.watchLaterList[index];
   
    this.watchLaterList.splice(index, 1);
   
  }

  clearWatchLater(): void {
  
  }
}
