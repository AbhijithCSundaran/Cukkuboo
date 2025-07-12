import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { environment } from '../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll/infinite-scroll.directive';


@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterLink,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    InfiniteScrollDirective
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  movies: any[] = [];
  imageUrl = environment.apiUrl + 'uploads/images/';
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  searchTimeout: any;
  stopInfiniteScroll: boolean = false;
  showSearch: boolean = false;
  movieType: '' | 'latest' | 'trending' | 'most_viewed' = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.showSearch = !!params['search'];
      this.movieType = params['typ'] ? params['typ'] : '';
      this.searchText = ''
      setTimeout(() => {
        if (this.showSearch) {
          this.searchInput.nativeElement.focus();
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }
  // isValidMovieType(value: any) {
  //   return ['', 'latest', 'trending', 'most_viewed'].includes(value);
  // }
  onScroll(event: any) {
    this.pageIndex++;
    this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
  }

  loadMovies(pageIndex: number = 0, pageSize: number = 20, search: string = '') {
    this.movieService.listMovies(pageIndex, pageSize, search, this.movieType).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length)
            this.movies = [...this.movies, ...res.data];
          else
            this.stopInfiniteScroll = true;
        }
      },
      error: (error) => {
        console.error(error);
        // const res = {
        //   "success": true,
        //   "message": "Paginated movies fetched successfully.",
        //   "data": [
        //     {
        //       "mov_id": "52",
        //       "video": "1752260816_c6eef9657c43dd103b92.mp4",
        //       "title": "Man of Steel",
        //       "genre": "0",
        //       "description": "\"Man of Steel\" is a 2013 American superhero film based on the DC Comics character Superman. It serves as a reboot of the Superman film series, focusing on Superman's origin story and his early days as a hero. The film explores his journey from being an alien child sent to Earth to embracing his destiny and becoming the symbol of hope for humanity. ",
        //       "cast_details": "Henry Cavill",
        //       "category": "0",
        //       "release_date": "2025-07-07",
        //       "age_rating": "2",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1752260815_79b1c31132cf029b9189.jpg",
        //       "trailer": "1752260819_ce43588ba496d736bf08.mp4",
        //       "banner": "1752260973_d886892d16ef38dd3614.jpg",
        //       "duration": "0m 19s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 19:10:58",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 19:10:58"
        //     },
        //     {
        //       "mov_id": "51",
        //       "video": "1752260312_f32b441b14199b4b4997.mp4",
        //       "title": " John Wick: Chapter 2",
        //       "genre": "0",
        //       "description": "In John Wick: Chapter 2, John Wick is forced back into the criminal underworld to fulfill a blood oath. He travels to Rome to assassinate a powerful figure within a shadowy international assassins' guild, facing deadly assassins along the way. The film expands on the world-building of the first movie, showcasing more of the intricate rules and operations of the assassins' network, while delivering intense action sequences and Keanu Reeves' signature performance as the titular character. ",
        //       "cast_details": "Keanu Reeves, Ruby Rose",
        //       "category": "0",
        //       "release_date": "2025-07-07",
        //       "age_rating": "1",
        //       "access": "2",
        //       "status": "1",
        //       "thumbnail": "1752260375_433ed5c24738bb708457.jpg",
        //       "trailer": "1752260315_e3cbd14b6d2d19f7914a.mp4",
        //       "banner": "1752260371_d30eaf446c2cef788fbd.jpg",
        //       "duration": "0m 26s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 19:00:59",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 19:00:59"
        //     },
        //     {
        //       "mov_id": "50",
        //       "video": "1752259323_0632b4a11b97ebb09d00.mp4",
        //       "title": "Mission: Impossible – Rogue Nation",
        //       "genre": "0",
        //       "description": "\"Mission: Impossible - Rogue Nation\" (2015) is the fifth installment in the \"Mission: Impossible\" film series, where Ethan Hunt and his IMF team face their most impossible mission yet. Disbanded by the CIA, they must take on the Syndicate, a dangerous international organization of rogue agents determined to destroy the IMF and reshape the world order. Hunt and his team, along with a mysterious British agent, Ilsa Faust, work to expose and dismantle the Syndicate. ",
        //       "cast_details": "Tom Cruise, Jeremy Renner",
        //       "category": "0",
        //       "release_date": "2025-07-08",
        //       "age_rating": "1",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1752259300_ea523dc1d9a29f8a794b.jpg",
        //       "trailer": "1752259307_74e7824eea7112f422f0.mp4",
        //       "banner": "1752259513_a7ba39d5a6476369dd2d.jpg",
        //       "duration": "0m 28s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 18:46:49",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 18:46:49"
        //     },
        //     {
        //       "mov_id": "49",
        //       "video": "1752257832_876837dca1859f225b08.mp4",
        //       "title": " Top Gun: Maverick",
        //       "genre": "0",
        //       "description": "\"Top Gun: Maverick\" is a 2022 action drama film and a sequel to the 1986 movie \"Top Gun\". It stars Tom Cruise as Pete \"Maverick\" Mitchell, a naval aviator who returns to the Top Gun program as an instructor. He must confront his past and train a group of elite young pilots, including the son of his deceased best friend, for a dangerous mission. ",
        //       "cast_details": "Tom Cruise, Miles Teller",
        //       "category": "0",
        //       "release_date": "2025-07-02",
        //       "age_rating": "1",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1752257897_b4c75956cbacf21d9920.jpg",
        //       "trailer": "1752257840_d822bb31bb82d56eaa72.mp4",
        //       "banner": "1752258067_81d5fdd894edbee0127f.jpg",
        //       "duration": "0m 12s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 18:22:58",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 18:22:58"
        //     },
        //     {
        //       "mov_id": "47",
        //       "video": "1752256739_8178bf67d88ac383de34.mp4",
        //       "title": "Forrest Gump",
        //       "genre": "0",
        //       "description": "Forrest Gump, American film, released in 1994, that chronicled 30 years (from the 1950s through the early 1980s) of the life of a intellectually disabled man (played by Tom Hanks) in an unlikely fable that earned critical praise, large audiences, and six Academy Awards, including best picture.",
        //       "cast_details": "Tom Hanks",
        //       "category": "0",
        //       "release_date": "2025-07-09",
        //       "age_rating": "2",
        //       "access": "2",
        //       "status": "1",
        //       "thumbnail": "1752256475_b74c810b46f5f8bcc5a9.jpg",
        //       "trailer": "1752256848_2db44707e6b3a1614768.mp4",
        //       "banner": "1752256557_accc0883627203e5c598.jpg",
        //       "duration": "0m 25s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 18:03:34",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 18:14:23"
        //     },
        //     {
        //       "mov_id": "46",
        //       "video": "1752256100_51f74604a8d09d5a6a07.mp4",
        //       "title": " Predestination",
        //       "genre": "0",
        //       "description": "\"Predestination\" is a mind-bending 2014 Australian sci-fi thriller about a temporal agent tasked with preventing a devastating bombing in New York City. The film explores complex time travel paradoxes and identity, as the agent's mission intertwines with his own past and future, creating a closed temporal loop. The movie is based on a short story by Robert A. Heinlein. ",
        //       "cast_details": "Sarah Snook, Ethan Hawke",
        //       "category": "0",
        //       "release_date": "2025-07-01",
        //       "age_rating": "2",
        //       "access": "2",
        //       "status": "1",
        //       "thumbnail": "1752255292_17caaab04c71983853ef.jpg",
        //       "trailer": "1752255968_96b5d5c81da3467d5ff0.mp4",
        //       "banner": "1752255289_4ec3049235cabbf6eb29.jpg",
        //       "duration": "0m 20s",
        //       "rating": "5",
        //       "likes": "0",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 17:48:31",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 17:48:31"
        //     },
        //     {
        //       "mov_id": "45",
        //       "video": "1752254678_5aa2f1f31e755eae57ba.mp4",
        //       "title": "Spider-Man: No Way Home",
        //       "genre": "0",
        //       "description": "Spider-Man: No Way Home focuses on Peter Parker's life after his identity as Spider-Man is revealed, leading to dangerous consequences for him and his loved ones. To fix the situation, he enlists Doctor Strange's help, but a spell goes wrong, unleashing powerful villains from other universes. Peter must now confront these foes, learn what it truly means to be Spider-Man, and face the consequences that will forever alter his future and the multiverse",
        //       "cast_details": "Tom Holland , Zendaya, Tobey Maguire, Andrew Garfield",
        //       "category": "0",
        //       "release_date": "2025-06-30",
        //       "age_rating": "1",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1752260684_f77396ac543907f6b447.jpg",
        //       "trailer": "1752254714_98df13d3536c136cb956.mp4",
        //       "banner": "1752254293_e252fc34da7ce2ab0ab0.jpg",
        //       "duration": "0m 17s",
        //       "rating": "5",
        //       "likes": "1",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-11 13:43:18",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 19:04:46"
        //     },
        //     {
        //       "mov_id": "42",
        //       "video": "1751872605_34a910b7f6c5f3e601c7.mp4",
        //       "title": "Breaking Bad",
        //       "genre": "2",
        //       "description": "\"Breaking Bad\" is a critically acclaimed American crime drama series that follows Walter White, a struggling high school chemistry teacher who, after being diagnosed with terminal lung cancer, turns to manufacturing methamphetamine to secure his family's financial future. The series, created by Vince Gilligan, explores the transformation of Walter from a mild-mannered teacher into a ruthless drug kingpin, known as Heisenberg. ",
        //       "cast_details": "Bryan Cranston, Aaron Paul",
        //       "category": "2",
        //       "release_date": "2025-07-01",
        //       "age_rating": "1",
        //       "access": "2",
        //       "status": "1",
        //       "thumbnail": "1751649528_e6b56858fb63896db5c1.jpg",
        //       "trailer": "1751649317_1644d205f4db08245b18.mp4",
        //       "banner": "1751649523_90352a9e6f192e9645f6.jpeg",
        //       "duration": "0m 12s",
        //       "rating": "5",
        //       "likes": "2",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-04 17:19:12",
        //       "modify_by": null,
        //       "modify_on": "2025-07-11 13:03:12"
        //     },
        //     {
        //       "mov_id": "41",
        //       "video": "1751872631_8e4c4027f892674f9711.mp4",
        //       "title": "La La Land",
        //       "genre": "2",
        //       "description": "\"La La Land\" is a 2016 romantic musical comedy-drama film written and directed by Damien Chazelle, starring Ryan Gosling and Emma Stone. It tells the story of a jazz pianist, Sebastian, and an aspiring actress, Mia, who fall in love while pursuing their dreams in Los Angeles. The film's title refers both to the city of Los Angeles and to the idiom for being out of touch with reality. ",
        //       "cast_details": "Ryan Gosling, Emma Stones",
        //       "category": "1",
        //       "release_date": "2025-06-30",
        //       "age_rating": "2",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1751648909_62cd703e0dc40698ff86.jpg",
        //       "trailer": "1751648800_fb358d76fea613791a0c.mp4",
        //       "banner": "1751648909_8b82efe3e603147aef12.jpg",
        //       "duration": "0m 13s",
        //       "rating": "5",
        //       "likes": "1",
        //       "dislikes": "0",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-04 17:08:33",
        //       "modify_by": null,
        //       "modify_on": "2025-07-07 07:17:13"
        //     },
        //     {
        //       "mov_id": "40",
        //       "video": "1751872663_cac9797e78747ac40ef0.mp4",
        //       "title": "game of Thrones",
        //       "genre": "2",
        //       "description": "Game of Thrones is a sprawling American fantasy drama series that explores the brutal power struggles among noble families vying for control of the Iron Throne in the fictional land of Westeros. The series, based on George R.R. Martin's A Song of Ice and Fire novels, features intricate political intrigue, complex characters, and a dark, realistic approach to fantasy. It is a story of ambition, betrayal, war, and ultimately, survival.",
        //       "cast_details": "Emilia Clarke , Kit Harington , Sophie Turner , Masie Williams",
        //       "category": "2",
        //       "release_date": "2025-07-01",
        //       "age_rating": "1",
        //       "access": "1",
        //       "status": "1",
        //       "thumbnail": "1751647880_98222745739a141472a2.jpg",
        //       "trailer": "1751648141_2959f35a1b51c2b513c2.mp4",
        //       "banner": "1751648063_86e5e586e393c4d4aa1e.jpg",
        //       "duration": "0m 19s",
        //       "rating": "5",
        //       "likes": "1",
        //       "dislikes": "1",
        //       "views": "0",
        //       "created_by": null,
        //       "created_on": "2025-07-04 16:56:18",
        //       "modify_by": null,
        //       "modify_on": "2025-07-10 11:19:08"
        //     }
        //   ],
        //   "total": 11
        // }
        // this.movies = [...this.movies, ...res.data];
        // if (this.movies.length > res.total)
        //   this.stopInfiniteScroll = true;
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;
      this.stopInfiniteScroll = false;
      this.movies = [];
      this.loadMovies(this.pageIndex, this.pageSize, this.searchText);
    }, 400);
  }

}
