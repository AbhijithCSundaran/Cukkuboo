import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovieShowComponent } from './add-movie-show.component';

describe('AddMovieShowComponent', () => {
  let component: AddMovieShowComponent;
  let fixture: ComponentFixture<AddMovieShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovieShowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMovieShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
