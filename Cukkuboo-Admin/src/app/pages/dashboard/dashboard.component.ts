import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalSubscribers = 0;
  totalMovies = 0;
  subscribersThisMonth = 0;
  revenueThisMonth = 0;

  latestContent: any[] = [];
  mostViewedMovies: any[] = [];
  recentTransactions: any[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getDashboardData().subscribe({
      next: (res) => {
        console.log('Full Dashboard Response:', res);

        if (res.success && res.data) {
          const data = res.data;

          this.totalSubscribers = data.subscriber_count || 0;
          this.totalMovies = data.active_movie_count || 0;
          this.subscribersThisMonth = data.active_user_count || 0;
          this.revenueThisMonth = Number(data.total_revenue) || 0;

          this.latestContent = data.latest_movies?.movies || [];
          this.mostViewedMovies = data.most_watched_movies?.movies || [];
          this.recentTransactions = data.transaction_list || [];

          console.log('Transaction List:', this.recentTransactions);
        }
      },
      error: (err) => {
        console.error('Dashboard API Error:', err);
      }
    });
  }
}
