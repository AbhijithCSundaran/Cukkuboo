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
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  imageUrl = environment.fileUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  searchTimeout: any;
  stopInfiniteScroll: boolean = false;
  showSearch: boolean = false;
  movieType: '' | 'latest' | 'trending' | 'most_viewed' = '';
  movieTypeTitle: string = '';
  randomBanner: string = 'assets/images/background/movie_banner.jpg';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {
    this.route.queryParams.subscribe(params => {
      this.showSearch = !!params['search'];
      this.movieType = params['typ'] || '';
      this.movieTypeTitle = this.movieType.replace(/_/g, ' ');
      this.searchText = '';
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

  onScroll(event: any) {
    this.pageIndex++;
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  loadMovies(pageIndex: number = 0, pageSize: number = 10, search: string = '') {
    this.movieService.listMovies(pageIndex, pageSize, search, this.movieType).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length) {
            this.movies = [...this.movies, ...res.data];

           
            if (pageIndex === 0) {
              const banners = res.data
               .map((m: any) => m.banner)
                .filter((b: string) => !!b);

              if (banners.length) {
                const randomIndex = Math.floor(Math.random() * banners.length);
                this.randomBanner = this.imageUrl + banners[randomIndex];
              }
            }
          } else {
            this.stopInfiniteScroll = true;
            if (pageIndex === 0) {
              this.randomBanner = 'assets/images/background/movie_banner.jpg';
            }
          }
        }
      },
      error: (error) => {
        console.error(error);
        this.randomBanner = 'assets/images/background/movie_banner.jpg';
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
