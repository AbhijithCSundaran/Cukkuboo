import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
 
    totalSubscribers = 1240;
    totalMovies = 320;
    subscribersThisMonth = 85;
    revenueThisMonth = 56340; 



    latestContent = [
      { title: 'Avengers: Secret Wars', date: '2025-05-08' },
      { title: 'Breaking Bad: The Return', date: '2025-05-07' },
      { title: 'Stranger Things S5', date: '2025-05-06' }
    ];
    
    mostViewedMovies = [
      { title: 'Avengers: Endgame', views: 9800 },
      { title: 'Inception', views: 9200 },
      { title: 'Titanic', views: 8800 },
      { title: 'The Dark Knight', views: 8700 },
      { title: 'Interstellar', views: 8500 },
      { title: 'Joker', views: 8300 },
      { title: 'Spider-Man: No Way Home', views: 8200 },
      { title: 'The Matrix', views: 8100 },
      { title: 'Avatar', views: 8000 },
      { title: 'The Lion King', views: 7900 }
    ];
    
}
