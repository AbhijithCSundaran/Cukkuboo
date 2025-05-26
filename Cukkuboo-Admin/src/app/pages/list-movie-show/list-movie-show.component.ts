import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

type FilterColumn = 'title' | 'genre' | 'category' | 'status';

@Component({
  selector: 'app-list-movie-show',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './list-movie-show.component.html',
  styleUrls: ['./list-movie-show.component.scss']
})
export class ListMovieShowComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'genre', 'category', 'status', 'action'];

  movies = [
    { id: 1, title: 'Inception', genre: 'Sci-Fi', category: 'Movie', status: 'active' },
    { id: 2, title: 'The Godfather', genre: 'Crime', category: 'Movie', status: 'inactive' },
    { id: 3, title: 'The Dark Knight', genre: 'Action', category: 'Movie', status: 'active' },
    { id: 4, title: 'Parasite', genre: 'Thriller', category: 'Movie', status: 'active' }
  ];

  dataSource = new MatTableDataSource(this.movies);

  filterValues: { [key in FilterColumn]: string } = {
    title: '',
    genre: '',
    category: '',
    status: ''
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchTerms = JSON.parse(filter);
      return (!searchTerms.title || data.title.toLowerCase().includes(searchTerms.title))
        && (!searchTerms.genre || data.genre.toLowerCase().includes(searchTerms.genre))
        && (!searchTerms.category || data.category.toLowerCase().includes(searchTerms.category))
        && (!searchTerms.status || data.status.toLowerCase().includes(searchTerms.status));
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(column: FilterColumn, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues[column] = filterValue;
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



  editMovie(id: number): void {
    this.router.navigate(['/edit-movie-show', id]);
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
