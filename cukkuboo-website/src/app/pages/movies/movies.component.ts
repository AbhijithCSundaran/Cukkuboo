import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterLink,
     MatFormFieldModule,   
    MatInputModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  imageBasePath = environment.imagePath;
   pageIndex: number = 0;
  pageSize: number = 20;
  totalItems: number = 0;
  searchText: string = '';
  searchTimeout: any;

  constructor(

    private movieService: MovieService,


  ) { }

  ngOnInit(): void {
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  loadMovies(pageIndex: number = 0, pageSize: number = 20, search: string = '') {
    this.movieService.listMovies(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          this.movies = res.data || [];
        }
      }
    });
  }


  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;
      this.movies = [];
      this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
    }, 400);
  }



}
