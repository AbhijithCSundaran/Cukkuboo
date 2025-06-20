import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  public customOptions1: OwlOptions = {
    loop: true, mouseDrag: true, touchDrag: true, pullDrag: true, navSpeed: 700,
    autoplay: true, autoplayTimeout: 5000, autoplayHoverPause: false, autoplayMouseleaveTimeout: 1000,
    items: 1,
    autoHeight: false, autoWidth: true,
    dots: true, nav: true, navText: ['<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>', '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>']
  }
  carouselOptions2: OwlOptions = {
    loop: false, mouseDrag: true, touchDrag: true, pullDrag: true,
    margin: 30, dots: false, autoplay: false,
    nav: true, navText: ['<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>', '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'],
    responsive: {
      0: { items: 1 }, 480: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 }
    }
  };
  carouselOptions3: OwlOptions = {
    loop: false, mouseDrag: true, touchDrag: true, pullDrag: true,  
    margin: 30, dots: false, autoplay: false,
    nav: true, navText: ['<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>', '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'],
    responsive: {
      0: { items: 1 }, 480: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 }
    }
  };

  carouselItems = [
    {
      background: 'assets/images/background/asset-1.jpeg',
      title: 'King of Skull',
      cast: 'Anna Romanson, Robert Romanson',
      rating: '12A',
      ratingImage: 'assets/images/asset-2.png',
      ratingValue: '0',
      trailer: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      image: 'assets/images/background/asset-1.jpeg',
      tags: ['4K Ultra', 'Brother', 'Dubbing', 'Premieres'],
      genres: ['Action', 'Animation', 'Family'],
      tagline: 'Most Viewed'
    },
    {
      background: 'assets/images/background/asset-3.jpeg',
      title: 'The Express',
      cast: 'Robert Romanson, Anne Good',
      rating: 'PG-14',
      ratingImage: 'assets/images/asset-2.png',
      ratingValue: '8.5',
      trailer: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      image: 'assets/images/background/asset-3.jpeg',
      tags: ['4K Ultra', 'King', 'Premieres', 'Viking'],
      genres: ['Action', 'Adventure', 'Biography'],
      tagline: 'Best Of 2021'
    },
    {
      background: 'assets/images/background/asset-4.jpeg',
      title: 'Thieve the Bank',
      cast: 'Jennifer Lonez, Mars Shelley',
      rating: 'TV-MA',
      ratingImage: 'assets/images/asset-2.png',
      ratingValue: '9.5',
      trailer: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      image: 'assets/images/background/asset-4.jpeg',
      tags: ['Brother', 'Hero', 'Premieres', 'Viking'],
      genres: ['Action', 'Mystery'],
      tagline: 'High Rated'
    }
  ];

  movies = [
    {
      id: 1,
      title: 'The Warrior Life',
      duration: '2hr 00mins',
      minutes: 120,
      genres: ['Action', 'Adventure', 'Drama'],
      image: 'assets/images/background/asset-5.jpeg'
    },
    {
      id: 2,
      title: 'Machine War',
      duration: '1hr 22mins',
      minutes: 82,
      genres: ['Action'],
      image: 'assets/images/background/asset-6.jpeg'
    },
    {
      id: 3,
      title: 'The Horse Lady',
      duration: '1hr 24mins',
      minutes: 84,
      genres: ['Drama'],
      image: 'assets/images/background/asset-7.jpeg'
    },
    {
      id: 4,
      title: 'Thieve The Bank',
      duration: '30min',
      minutes: 30,
      genres: ['Action'],
      image: 'assets/images/background/asset-4.jpeg'
    },
    {
      id: 5,
      title: 'Ship Of Full Moon',
      duration: '1hr 35mins',
      minutes: 95,
      genres: ['Action'],
      image: 'assets/images/background/asset-8.jpeg'
    },
    {
      id: 6,
      title: 'The Giant Ship',
      duration: '1h 02 mins',
      minutes: 62,
      genres: ['Action'],
      image: 'assets/images/background/asset-11.jpeg'
    },
    {
      id: 7,
      title: 'Common Man’s Idea',
      duration: '1hr 51 mins',
      minutes: 111,
      genres: ['Action'],
      image: 'assets/images/background/asset-12.jpeg'
    },
    {
      id: 8,
      title: 'The Jin’s Friend',
      duration: '1hr 42 mins',
      minutes: 102,
      genres: ['Action'],
      image: 'assets/images/background/asset-13.jpeg'
    },
    {
      id: 9,
      title: 'Rebuneka the Doll',
      duration: '1hr 44 mins',
      minutes: 104,
      genres: ['Action'],
      image: 'assets/images/background/asset-9.jpeg'
    },
    {
      id: 10,
      title: 'Iron Mountain',
      duration: '1hr 28 mins',
      minutes: 88,
      genres: ['Action'],
      image: 'assets/images/background/asset-14.jpeg'
    }
  ];



}
