import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MovieService } from '../../services/movie.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



type FilterColumn = 'title' | 'genre' | 'category' | 'status';

@Component({
  selector: 'app-list-movie-show',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
       MatFormFieldModule,  
    MatInputModule      
  ],
  templateUrl: './list-movie-show.component.html',
  styleUrls: ['./list-movie-show.component.scss']
})
export class ListMovieShowComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo','title', 'genre', 'category', 'status', 'action'];
  
  dataSource = new MatTableDataSource<any>([]);
  confirmDeleteMovie: any = null;

  filterValues: { [key in FilterColumn]: string } = {
    title: '',
    genre: '',
    category: '',
    status: ''
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private movieService: MovieService,private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.listMovies();

    this.dataSource.filterPredicate = (data, filter) => {
      const searchTerms = JSON.parse(filter);
      return (!searchTerms.title || data.title?.toLowerCase().includes(searchTerms.title))
        && (!searchTerms.genre || data.genre?.toLowerCase().includes(searchTerms.genre))
        && (!searchTerms.category || data.category?.toLowerCase().includes(searchTerms.category))
        && (!searchTerms.status || data.status?.toLowerCase().includes(searchTerms.status));
    };
  }

    showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  listMovies(): void {
    const model = {}; 
    this.movieService.listmovies(model).subscribe({
      next: (response) => {
          console.log('API response from listmovies():', response); 
        this.dataSource.data = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
        this.dataSource.data = [];
      }
    });
  }

  applyFilter(column: FilterColumn, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues[column] = filterValue;
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

// editMovie(id: number): void {
//   // console.log('Navigating to edit page with ID:', id); 
//   if (id === undefined || id === null) {
//     console.error('Invalid ID passed to editMovie()');
//     return;
//   }
//   this.router.navigate(['/edit-movie-show', id]);
// }

// deleteMovie(movie: any): void {
//   if (confirm(`Are you sure you want to delete the movie "${movie.title}"?`)) {
//     this.movieService.deletemovies(movie.mov_id).subscribe({
//       next: () => {
//         const index = this.dataSource.data.findIndex(m => m.mov_id === movie.mov_id);
//         if (index > -1) {
//           this.dataSource.data.splice(index, 1);
//           this.dataSource.data = [...this.dataSource.data];
//         }
//         this.showSnackbar('Movie deleted successfully!', 'snackbar-success');
//       },
//       error: (err) => {
//         console.error('Failed to delete movie:', err);
//         this.showSnackbar('Failed to delete movie. Please try again.', 'snackbar-error');
//       }
//     });
//   }
// }




modalDeleteMovie(movie: any): void {
  this.confirmDeleteMovie = movie;
}

cancelDelete(): void {
  this.confirmDeleteMovie = null;
}

confirmDelete(): void {
  const movie = this.confirmDeleteMovie;
  if (!movie) return;

  console.log('Deleting movie with id:', movie.mov_id);

  this.movieService.deleteMovies(movie.mov_id).subscribe({
    next: () => {
      console.log('Delete successful, updating dataSource');
      this.dataSource.data = this.dataSource.data.filter(m => m.mov_id !== movie.mov_id);
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

  applyGlobalFilter(event: Event): void {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

  this.dataSource.filterPredicate = (data, filter: string) => {
    const title = data.title?.toLowerCase() || '';
    const genre = this.getGenreName(data.genre).toLowerCase();
    const category = this.getCategoryName(data.category).toLowerCase();
    const status = data.status === '1' ? 'active' : 'inactive';

    return (
      title.includes(filter) ||
      genre.includes(filter) ||
      category.includes(filter) ||
      status.includes(filter)
    );
  };

  this.dataSource.filter = filterValue;

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}
getGenreName(code: string): string {
  switch (code) {
    case '1': return 'Action';
    case '2': return 'Drama';
    case '3': return 'Comedy';
    default: return 'Other';
  }
}

getCategoryName(code: string): string {
  switch (code) {
    case '1': return 'Movie';
    case '2': return 'Show';
    default: return 'Other';
  }
}

}
