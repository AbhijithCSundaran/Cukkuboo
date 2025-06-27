import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  // constructor(private router: Router, private route: ActivatedRoute) {
  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe(() => {
  //       setTimeout(() => {
  //         this.scrollTo();
  //       }, 0);
  //     });

  //   this.route.queryParams.subscribe(() => {
  //     this.scrollTo();
  //   });

  //   this.route.params.subscribe(() => {
  //     this.scrollTo();
  //   });
  // }

  scrollTo(top: number = 0) {
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
}
