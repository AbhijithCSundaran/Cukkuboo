import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  movies: any[] = [];
  imageUrl = environment.apiUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  searchTimeout: any;
  stopInfiniteScroll: boolean = false;
  showSearch: boolean = false;
  movieType: '' | 'latest' | 'trending' | 'most_viewed' = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.showSearch = !!params['search'];
      this.movieType = params['typ'] ? params['typ'] : '';
      this.searchText = ''
      setTimeout(() => {
        if (this.showSearch) {
          this.searchInput.nativeElement.focus();
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }
  // isValidMovieType(value: any) {
  //   return ['', 'latest', 'trending', 'most_viewed'].includes(value);
  // }
  onScroll(event: any) {
    this.pageIndex++;
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  loadMovies(pageIndex: number = 0, pageSize: number = 10, search: string = '') {
    this.movieService.listMovies(pageIndex, pageSize, search, this.movieType).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length)
            this.movies = [...this.movies, ...res.data];
          else
            this.stopInfiniteScroll = true;
        }
      },
      error: (error) => {
        console.error(error);
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
