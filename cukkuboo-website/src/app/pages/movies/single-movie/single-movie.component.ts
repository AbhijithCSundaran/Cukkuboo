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

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.getMovie(id);
  }

  getMovie(id: number): void {
    this.movieService.getMovieById(id).subscribe({
      next: (res) => {
        if (res?.data) {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          console.log('Movie Response:', data);

          this.movie = {
            ...data,
            title: data.title || 'Untitled Movie',
            image: this.imageUrl + (data.thumbnail || 'default-thumb.jpg'),
            background: this.imageUrl + (data.banner || 'default-banner.jpg'),
            trailer: this.videoUrl + (data.trailer || ''),
            video: this.videoUrl + (data.video || ''),
            cast_details: data.cast_details || data.cast || 'N/A',
            duration: data.duration || 'Unknown',
            release_date: data.release_date || 'Unknown',
            playTrailer: false,
            playVideo: false
          };
        } else {
          this.snackBar.open('Failed to load movie.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error loading movie data.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  playVideo(movie: any): void {
    movie.playTrailer = false;
    movie.playVideo = true;
  }
}
