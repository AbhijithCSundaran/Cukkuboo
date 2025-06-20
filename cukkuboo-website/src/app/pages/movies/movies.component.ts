import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-movies',
  imports: [CommonModule,RouterLink, RouterLinkActive],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  movies: any[] = []; 
  imageBasePath = environment.imagePath; 

  constructor(
   
    private movieService: MovieService,
    
   
  ) {}

   ngOnInit(): void {
     this.loadMovies();
  }
  loadMovies(){
    this.movieService.listMovies().subscribe({
      next:(res) => {
          if (res?.status && res.data?.length > 0) {
          this.movies = res.data;
           console.log('API response:', this.movies); 
       }
      }
    })
  }


}
