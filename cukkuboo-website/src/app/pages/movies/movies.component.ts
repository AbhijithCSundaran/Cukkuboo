import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';


@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterLink,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    InfiniteScrollDirective
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  imageUrl = environment.apiUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  searchTimeout: any;
  stopInfiniteScroll: boolean = false;

  constructor(
    private movieService: MovieService,
  ) { }

  ngOnInit(): void {
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }
  onScroll(event: any) {
    this.pageIndex++;
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  loadMovies(pageIndex: number = 0, pageSize: number = 20, search: string = '') {
    this.movieService.listMovies(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length)
            this.movies = [...this.movies, ...res.data];
          else
            this.stopInfiniteScroll = true;
        }
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;
      this.stopInfiniteScroll = false;
      this.movies = [];
      this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
    }, 400);
  }

}
