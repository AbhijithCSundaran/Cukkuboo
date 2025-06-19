import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselModule],
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

  carouselItems = [
    {
      background: 'assets/images/background/asset-1.jpeg',
      title: 'King of Skull',
      cast: 'Anna Romanson, Robert Romanson',
      rating: '12A',
      ratingImage: 'assets/images/asset-2.png',
      ratingValue: '0',
      trailer: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      image: 'images/background/asset-1.jpeg',
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

}
