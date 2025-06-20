import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movies',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  movies: any[] = []; 

  constructor(
   
    private movieService: MovieService,
    
   
  ) {}

   ngOnInit(): void {
     this.loadMovies();
  }
  loadMovies(){
    this.movieService.listMovies().subscribe({
      next:(res) => {
        console.log('API response:', res); 
         if (res?.status && res.data?.length > 0) {
          this.movies = res.data;
       }
      }
    })
  }


}
