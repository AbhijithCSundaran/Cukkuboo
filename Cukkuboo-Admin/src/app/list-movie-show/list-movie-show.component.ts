import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-movie-show',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, CommonModule],
  templateUrl: './list-movie-show.component.html',
  styleUrls: ['./list-movie-show.component.scss']
})
export class ListMovieShowComponent {
  displayedColumns: string[] = ['title', 'genre', 'rating', 'category', 'status', 'action'];

  movies = [
    { title: 'Inception', genre: 'Sci-Fi', rating: '8.8', category: 'Movie', status: 'active' },
    { title: 'The Godfather', genre: 'Crime', rating: '9.2', category: 'Movie', status: 'inactive' },
    { title: 'The Dark Knight', genre: 'Action', rating: '9.0', category: 'Movie', status: 'active' },
    { title: 'Parasite', genre: 'Thriller', rating: '8.6', category: 'Movie', status: 'active' }
  ];

  dataSource = new MatTableDataSource(this.movies);

  constructor(private router: Router) {}

  editMovie(movie: any): void {
    // Navigate to the Add Movie/Show page with the movie data as query params
    this.router.navigate(['/add-movie-show'], {
      queryParams: { 
        title: movie.title,
        genre: movie.genre,
        rating: movie.rating,
        category: movie.category,
        status: movie.status
      }
    });
  }

  deleteMovie(movie: any): void {
    const index = this.movies.indexOf(movie);
    if (index > -1) {
      this.movies.splice(index, 1);
      this.dataSource.data = [...this.movies];
    }
  }

  addNewMovie(): void {
    this.router.navigate(['/add-movie-show']);
  }
}
