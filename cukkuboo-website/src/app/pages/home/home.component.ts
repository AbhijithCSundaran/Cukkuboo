import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [CommonModule, CarouselModule, RouterLink]
})
export class HomeComponent implements OnInit {
  constructor(private homeService: HomeService) {}

  carouselItems: any[] = [];
  movies: any[] = [];

  public customOptions1: OwlOptions = {
    loop: true, mouseDrag: true, touchDrag: true, pullDrag: true, navSpeed: 700,
    autoplay: true, autoplayTimeout: 7500, autoplayHoverPause: false, autoplayMouseleaveTimeout: 1000,
    items: 1, autoHeight: false, autoWidth: true,
    dots: true, nav: true,
    navText: ['<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>', '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>']
  };

  carouselOptions2: OwlOptions = {
    loop: false, mouseDrag: true, touchDrag: true, pullDrag: true,
    margin: 30, dots: false, autoplay: false, navSpeed: 2000, autoplayTimeout: 5000,
    nav: true,
    navText: ['<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>', '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'],
    responsive: {
      0: { items: 1 }, 480: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 }
    }
  };

  ngOnInit(): void {
    console.log('Fetching home data...');
    this.homeService.getHomeData().subscribe({
      next: (response) => {
        console.log('API Response:', response);

        this.carouselItems = response.banners || [];
        this.movies = response.movies || [];

        console.log('carouselItems:', this.carouselItems);
        console.log('movies:', this.movies);
      },
      error: (error) => {
        console.error('Error fetching home data:', error);
      }
    });
  }
}
