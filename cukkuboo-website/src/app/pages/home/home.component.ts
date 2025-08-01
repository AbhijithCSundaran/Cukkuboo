import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { TruncatePipe } from '../../core/pipes/truncate-pipe';
import { JsPlayerComponent } from '../_common/js-player/js-player.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterLink,
    JsPlayerComponent, TruncatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  HomeData: any;
  bannerData: any;
  listSections: any[] = [];
  videoUrl = environment.fileUrl + 'uploads/videos/';
  imageUrl = environment.fileUrl + 'uploads/images/';

  selectedItem: any;
  constructor(
    private movieService: MovieService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.movieService.getHomeData().subscribe({
      next: (response: any) => {
        if (response) {
          this.HomeData = response.data
          this.bannerData = this.HomeData.list_1;
          this.listSections = [];
          Object.keys(this.HomeData).forEach(key => {
            if (key.startsWith('list_') && key !== 'list_1') {
              this.listSections.push(this.HomeData[key]);
            }
          });
          // console.log('Home Data:', this.HomeData);
          console.log(this.bannerData, this.listSections);

        }
      },
      error: (err) => {
        console.error('Error loading home data:', err)
     }
    });
  }

  customOptions1: OwlOptions = {
    loop: true, mouseDrag: true, touchDrag: true, pullDrag: true, navSpeed: 700,
    autoplay: false, autoplayTimeout: 7500, autoplayHoverPause: true, autoplayMouseleaveTimeout: 700,
    items: 1, autoHeight: false, autoWidth: true, dots: true, nav: true,
    navText: [
      '<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>',
      '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'
    ]
  };

  carouselOptions2: OwlOptions = {
    loop: false, mouseDrag: true, touchDrag: true, pullDrag: true, margin: 30,
    dots: false, autoplay: false, navSpeed: 1000, autoplayTimeout: 5000, nav: true,
    navText: [
      '<span class="material-icons" style="font-size:18px">arrow_back_ios_new</span>',
      '<span class="material-icons" style="font-size:18px">arrow_forward_ios</span>'
    ],
    responsive: {
      0: { items: 1 }, 480: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 }
    }
  };

  playTrailer(item: any) {
    this.customOptions1.autoplay = false;
    this.selectedItem = item;
  }
  onCloseTrailer(event: any) {
    this.selectedItem = null;
    this.customOptions1.autoplay = true;
  }
  gotoMovies(item: any) {
    const type = item.heading.replace(/movies?/i, '').replace(/watched/i, 'viewed').trim().toLowerCase().replace(/\s+/g, '_')
    this.router.navigate(['/movies'], { queryParams: { typ: type } });
  }

  hasListMovies(): boolean {
  return this.listSections?.some(section => section.data?.length > 0);
}

}
