import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterLink],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  imageBasePath = environment.imagePath;

  constructor(

    private movieService: MovieService,


  ) { }

  ngOnInit(): void {
    this.loadMovies();
  }
  loadMovies() {
    this.movieService.listMovies().subscribe({
      next: (res) => {
        if (res?.success) {
          this.movies = res.data||[];
        }
      }
    })
  }


}
