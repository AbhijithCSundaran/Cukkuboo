import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MovieService } from '../../../services/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { PalyerComponent } from '../../_common/palyer/palyer.component';

@Component({
  selector: 'app-single-movie',
  standalone: true,
  imports: [CommonModule, PalyerComponent],
  templateUrl: './single-movie.component.html',
  styleUrls: ['./single-movie.component.scss']
})
export class SingleMovieComponent implements OnInit {
  movie: any;
  video: string = '';
  thumbnail: string = '';
  videoUrl = environment.apiUrl + 'uploads/videos/';
  imageUrl = environment.apiUrl + 'uploads/images/';
  suggetionList: any[] = [
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
  MovieData: any = {
    background: 'assets/images/background/asset-1.jpeg',
    title: 'King of Skull',
    cast: 'Anna Romanson, Robert Romanson',
    rating: '12A',
    ratingImage: 'assets/images/asset-2.png',
    ratingValue: '0',
    trailer: '1750395879_43c5c1290493bc3ce7c1.mp4',
    video: '1750395879_43c5c1290493bc3ce7c1.mp4',
    image: 'assets/images/background/asset-1.jpeg',
    tags: ['4K Ultra', 'Brother', 'Dubbing', 'Premieres'],
    genres: ['Action', 'Animation', 'Family'],
    tagline: 'Most Viewed'
  }
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id)
      this.getMovie(id)
  }

  getMovie(id: any) {
    this.movieService.getMovieById(id).subscribe({
      next: (res) => {
        // console.log('Movie Data:', res);
        if (res.data) {
          this.movie = res.data;
        }
        else {
          this.snackBar.open('Failed to load movie.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => console.error(err)
    });
  }
  playVideo(movie: any) {
    movie.playTrailer = false;
    movie.playVideo = true;
  }
}
