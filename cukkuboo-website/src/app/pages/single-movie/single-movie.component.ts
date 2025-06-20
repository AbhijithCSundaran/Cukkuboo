import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-movie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-movie.component.html',
  styleUrls: ['./single-movie.component.scss']
})
export class SingleMovieComponent implements OnInit {
  movie: any;
  videoUrl: SafeResourceUrl | null = null;
  thumbnail: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.movieService.getMovieById(id).subscribe({
        next: (res) => {
          const data = res.data;
          this.movie = data;
       
        },
        error: (err) => console.error('Movie fetch failed', err)
      });
    }
  }
}
