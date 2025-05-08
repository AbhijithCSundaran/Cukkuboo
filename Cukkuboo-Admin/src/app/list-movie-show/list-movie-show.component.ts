import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-list-movie-show',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, CommonModule,MatPaginatorModule,],
  templateUrl: './list-movie-show.component.html',
  styleUrls: ['./list-movie-show.component.scss']
})
export class ListMovieShowComponent {
  displayedColumns: string[] = ['title', 'genre',  'category', 'status', 'action'];

  movies = [
    { title: 'Inception', genre: 'Sci-Fi',  category: 'Movie', status: 'active' },
    { title: 'The Godfather', genre: 'Crime',  category: 'Movie', status: 'inactive' },
    { title: 'The Dark Knight', genre: 'Action',  category: 'Movie', status: 'active' },
    { title: 'Parasite', genre: 'Thriller',  category: 'Movie', status: 'active' }
  ];

  dataSource = new MatTableDataSource(this.movies);

  constructor(private router: Router) {}

  editMovie(movie: any): void {
  
    this.router.navigate(['/add-movie-show'], {
  
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
