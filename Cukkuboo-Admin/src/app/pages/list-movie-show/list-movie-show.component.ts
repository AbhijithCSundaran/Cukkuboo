import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MovieService } from '../../services/movie.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-movie-show',
  standalone: true,
  templateUrl: './list-movie-show.component.html',
  styleUrls: ['./list-movie-show.component.scss'],
  imports: [
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ]
})
export class ListMovieShowComponent implements OnInit {
  displayedColumns: string[] = [
    'slNo',
    'title',
    'access',
    'likes',
    'dislikes',
    'views',
    'status',
    'action'
  ];

  dataSource = new MatTableDataSource<any>([]);

  confirmDeleteMovie: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';

  constructor(
    private router: Router,
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.listMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.listMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  // Fetch movies list from API with pagination & search
  listMovies(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.movieService.listmovies(pageIndex, pageSize, search).subscribe({
      next: (response) => {
        // Update table data and total items
        this.dataSource.data = response?.data || [];
        this.totalItems = response?.total || 0;
      },
      error: (error) => {
        // On error, clear table and show error message
        console.error('Error fetching movies:', error);
        this.dataSource.data = [];
        this.totalItems = 0;
        this.showSnackbar('Failed to load movies. Please try again.', 'snackbar-error');
      }
    });
  }

  // Search filter applied globally on typing
  applyGlobalFilter(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = filterValue;
    this.pageIndex = 0; // Reset to first page after search
    this.listMovies(this.pageIndex, this.pageSize, this.searchText);
  }


  modalDeleteMovie(movie: any): void {
    this.confirmDeleteMovie = movie;
  }

  cancelDelete(): void {
    this.confirmDeleteMovie = null;
  }


  confirmDelete(): void {
    const movie = this.confirmDeleteMovie;
    if (!movie) return;

    this.movieService.deleteMovies(movie.mov_id).subscribe({
      next: () => {
        // Remove movie from local table list
        this.dataSource.data = this.dataSource.data.filter(m => m.mov_id !== movie.mov_id);
        this.totalItems--;
        // Reload movie list to ensure sync with backend
        this.listMovies(this.pageIndex, this.pageSize, this.searchText);
        this.showSnackbar('Movie deleted successfully!', 'snackbar-success');
      },
      error: (err) => {
        console.error('Failed to delete movie:', err);
        this.showSnackbar('Failed to delete movie. Please try again.', 'snackbar-error');
      }
    });

   
    this.confirmDeleteMovie = null;
  }


  addNewMovie(): void {
    this.router.navigate(['/add-movie-show']);
  }

 
  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  // Format large numbers into readable format (K, M)
  formatNumber(value: number): string {
    if (value >= 1_000_000) {
      const truncated = Math.floor((value / 1_000_000) * 10) / 10;
      return truncated + 'M'; // 1.2M
    } else if (value >= 1_000) {
      const truncated = Math.floor((value / 1_000) * 10) / 10;
      return truncated + 'K'; // 5.4K
    } else {
      return value.toString();
    }
  }
}
