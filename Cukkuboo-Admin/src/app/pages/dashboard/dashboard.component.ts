import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  totalSubscribers = 1240;
  totalMovies = 320;
  subscribersThisMonth = 85;
  revenueThisMonth = 56340;

  latestContent: any[] = [];
  mostViewedMovies: any[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMostWatchedMovies();
    this.loadLatestMovies(); // 👈 Add this
  }

  loadMostWatchedMovies(): void {
    this.movieService.getMostWatchedMovies()
      .subscribe({
        next: (response) => {
          console.log('Most Watched Movies Response:', response);
          this.mostViewedMovies = response?.data || [];
        },
        error: (err) => {
          console.error('Failed to load most watched movies:', err);
        }
      });
  }

  loadLatestMovies(): void {
    this.movieService.getLatestMovies()
      .subscribe({
        next: (response) => {
          console.log('Latest Movies Response:', response);
          this.latestContent = response?.data || [];
        },
        error: (err) => {
          console.error('Failed to load latest movies:', err);
        }
      });
  }
}
