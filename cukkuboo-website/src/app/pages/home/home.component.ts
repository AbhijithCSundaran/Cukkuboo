import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  HomeData:any;
  featured: any[] = [];
  trendingMovies: any[] = [];
  latestMovies: any[] = [];
  mostWatchedMovies: any[] = [];
  // In_active_movie_count: ['']
  // active_movie_count: ['']


  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getHomeData().subscribe({
      next: (data: any) => {
        console.log('Home Data:', data);
        // this.featured = data?.featured?.data || [];
        // this.trendingMovies = data?.trending_now?.data || [];
        //   this.latestMovies = data?.latest_movies?.data || [];
      
        // this.mostWatchedMovies = data?.most_watch_movies?.data || [];
      },
      error: (err) => console.error('Error loading home data:', err)
    });
  }

  customOptions1: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    navSpeed: 700,
    autoplay: true,
    autoplayTimeout: 7500,
    autoplayHoverPause: false,
    autoplayMouseleaveTimeout: 1000,
    items: 1,
    autoHeight: false,
    autoWidth: true,
    dots: true,
    nav: true,
    navText: [
      '<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>',
      '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'
    ]
  };

  carouselOptions2: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 30,
    dots: false,
    autoplay: false,
    navSpeed: 2000,
    autoplayTimeout: 5000,
    nav: true,
    navText: [
      '<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>',
      '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'
    ],
    responsive: {
      0: { items: 1 },
      480: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 }
    }
  };
}
