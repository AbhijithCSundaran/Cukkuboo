import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-single-movie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-movie.component.html',
  styleUrls: ['./single-movie.component.scss']
})
export class SingleMovieComponent implements OnInit {
  movie: any;
  video: string = '';
  thumbnail: string = '';
  videoUrl = environment.apiUrl+'uploads/videos/';
  imageUrl = environment.apiUrl+'uploads/images/';

  constructor(
    private route: ActivatedRoute,
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
}
