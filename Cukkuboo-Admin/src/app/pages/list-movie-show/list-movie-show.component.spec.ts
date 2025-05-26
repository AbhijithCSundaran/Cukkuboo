import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMovieShowComponent } from './list-movie-show.component';

describe('ListMovieShowComponent', () => {
  let component: ListMovieShowComponent;
  let fixture: ComponentFixture<ListMovieShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMovieShowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMovieShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
